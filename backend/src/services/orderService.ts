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
import { createInvoiceForOrder } from './stripeService';

/**
 * Order Service
 * 
 * Handles all business logic for order management.
 */

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
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
    })
    .select()
    .single();

  if (error) {
    console.error('Database error creating order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }

  const order = data as Order;

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
  const finalPrice = totalPriceCents || calculateTotalPrice(order.food_selection);

  // Create Stripe invoice
  const { invoiceId, invoiceUrl } = await createInvoiceForOrder(order, finalPrice);

  // Update order in database
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'invoice_sent',
      time_confirmed_at: new Date().toISOString(),
      invoice_sent_at: new Date().toISOString(),
      total_price_cents: finalPrice,
      stripe_invoice_id: invoiceId,
      stripe_invoice_url: invoiceUrl,
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



