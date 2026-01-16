import { supabase } from '../config/database';
import { Order, CreateOrderRequest } from '../types';
import { calculateTotalPrice } from '../config/menu';
import { 
  sendNewOrderNotificationToOwner, 
  sendOrderPendingToCustomer,
  sendOrderApprovedToCustomer,
  sendOrderInvoiceToCustomer,
  sendOrderDeniedToCustomer,
  sendOrderApprovedToOwner,
  sendOrderDeniedToOwner
} from './emailService';
import { createPaymentLinkForOrder } from './stripeService';
import { validatePromoCode, incrementPromoCodeUsage } from './promoCodeService';

/**
 * Order Service
 * 
 * Handles all business logic for order management.
 */

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  // Validate promo code if provided
  let promoCodeId: string | undefined;
  let discountPercent: number | undefined;

  if (orderData.promo_code) {
    const promoResult = await validatePromoCode(orderData.promo_code);
    if (!promoResult.valid) {
      throw new Error(promoResult.error || 'Invalid promo code');
    }
    promoCodeId = promoResult.promo_code!.id;
    discountPercent = promoResult.promo_code!.discount_percent;
  }

  // Insert order into database
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      address: orderData.address,
      food_selection: orderData.food_selection,
      date_needed: orderData.date_needed,
      notes: orderData.notes,
      status: 'pending',
      promo_code_id: promoCodeId,
      discount_percent: discountPercent,
    })
    .select()
    .single();

  if (error) {
    console.error('Database error creating order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }

  const order = data as Order;

  // Increment promo code usage if one was used
  if (promoCodeId) {
    incrementPromoCodeUsage(promoCodeId).catch(err => 
      console.error('Error incrementing promo code usage:', err)
    );
  }

  // Send email notifications (async, don't wait)
  Promise.all([
    sendNewOrderNotificationToOwner(order),
    sendOrderPendingToCustomer(order),
  ]).catch(err => console.error('Error sending emails:', err));

  return order;
}

/**
 * Get all orders, optionally filtered by status
 */
export async function getOrders(status?: string): Promise<Order[]> {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Database error fetching orders:', error);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data as Order[];
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Database error fetching order:', error);
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return data as Order;
}

/**
 * Approve an order and propose delivery time
 * Status: pending -> approved_pending_time
 */
export async function approveOrder(orderId: string, approvalMessage: string): Promise<Order> {
  // Get the order
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'pending') {
    throw new Error(`Order is already ${order.status}`);
  }

  // Update order in database
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'approved_pending_time',
      approval_message: approvalMessage,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Database error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  const updatedOrder = data as Order;

  // Send email notifications (async, don't wait)
  Promise.all([
    sendOrderApprovedToCustomer(updatedOrder),
    sendOrderApprovedToOwner(updatedOrder),
  ]).catch(err => console.error('Error sending emails:', err));

  return updatedOrder;
}

/**
 * Confirm time and send invoice
 * Status: approved_pending_time -> invoice_sent
 */
export async function confirmTimeAndSendInvoice(orderId: string, totalPriceCents?: number): Promise<Order> {
  // Get the order
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'approved_pending_time') {
    throw new Error(`Order status must be approved_pending_time, currently ${order.status}`);
  }

  // Calculate price if not provided
  let originalPrice = totalPriceCents || calculateTotalPrice(order.food_selection);
  let finalPrice = originalPrice;

  // Apply discount if promo code was used
  if (order.discount_percent && order.discount_percent > 0) {
    finalPrice = Math.round(originalPrice * (1 - order.discount_percent / 100));
    console.log(`Applied ${order.discount_percent}% discount: $${(originalPrice / 100).toFixed(2)} -> $${(finalPrice / 100).toFixed(2)}`);
  }

  // Create Stripe payment link with discounted price
  const { paymentLinkId, paymentLinkUrl } = await createPaymentLinkForOrder(order, finalPrice);

  // Update order in database
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'invoice_sent',
      time_confirmed_at: new Date().toISOString(),
      invoice_sent_at: new Date().toISOString(),
      total_price_cents: finalPrice,
      original_price_cents: order.discount_percent ? originalPrice : null,
      stripe_invoice_id: paymentLinkId,
      stripe_invoice_url: paymentLinkUrl,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Database error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  const updatedOrder = data as Order;

  // Send invoice email to customer (async, don't wait)
  sendOrderInvoiceToCustomer(updatedOrder)
    .catch(err => console.error('Error sending invoice email:', err));

  return updatedOrder;
}

/**
 * Mark order as paid (called by Stripe webhook or manually)
 * Status: invoice_sent -> paid
 */
export async function markOrderAsPaid(orderId: string): Promise<Order> {
  // Get the order
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'invoice_sent') {
    throw new Error(`Order status must be invoice_sent, currently ${order.status}`);
  }

  // Update order in database
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Database error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  return data as Order;
}

/**
 * Deny an order with a reason
 */
export async function denyOrder(orderId: string, adminReason: string): Promise<Order> {
  // Get the order
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'pending') {
    throw new Error(`Order is already ${order.status}`);
  }

  // Update order in database
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'denied',
      admin_reason: adminReason,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Database error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  const updatedOrder = data as Order;

  // Send email notifications (async, don't wait)
  Promise.all([
    sendOrderDeniedToCustomer(updatedOrder),
    sendOrderDeniedToOwner(updatedOrder),
  ]).catch(err => console.error('Error sending emails:', err));

  return updatedOrder;
}



