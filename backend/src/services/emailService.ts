import { resend, OWNER_EMAIL, FROM_EMAIL } from '../config/email';
import { Order } from '../types';
import { getMenuItemById } from '../config/menu';

/**
 * Email Service
 * 
 * Handles all email notifications for Gio's Corner.
 * Uses Resend for reliable email delivery.
 * 
 * Customize email content and styling as needed.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Format price in cents to dollar string
 */
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format food selection for email display
 */
function formatFoodSelection(order: Order): string {
  return order.food_selection
    .map(item => {
      const menuItem = getMenuItemById(item.menu_item_id);
      const itemName = menuItem ? menuItem.name : item.menu_item_id;
      const itemPrice = menuItem ? formatPrice(menuItem.price_cents) : '';
      const notes = item.notes ? ` (${item.notes})` : '';
      return `• ${itemName} x${item.quantity} ${itemPrice}${notes}`;
    })
    .join('\n');
}

/**
 * Send email notification to owner about new order
 */
export async function sendNewOrderNotificationToOwner(order: Order): Promise<void> {
  try {
    const adminUrl = `${FRONTEND_URL}/admin`;
    
    const result = await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `🔔 New Order from ${order.customer_name} - Pending Review`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Catering Order Received</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Date Needed:</strong> ${order.date_needed}</p>
            <p><strong>Delivery Address:</strong><br/>${order.address}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Food Selection</h3>
            <pre style="white-space: pre-wrap; font-family: monospace;">${formatFoodSelection(order)}</pre>
          </div>
          
          ${order.notes ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Special Notes</h4>
            <p>${order.notes}</p>
          </div>
          ` : ''}
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${adminUrl}" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review in Admin Dashboard
            </a>
          </div>
          
          <p style="color: #6c757d; font-size: 14px;">
            This order is pending your review. Please accept or deny it from the admin dashboard.
          </p>
        </div>
      `,
    });
    
    console.log(`✅ New order notification sent to owner for order ${order.id}`);
    console.log('   Resend response:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ Failed to send new order notification to owner:', error);
    console.error('   Error details:', JSON.stringify(error, null, 2));
    // Don't throw - we don't want email failures to break order creation
  }
}

/**
 * Send confirmation email to customer that order is pending
 */
export async function sendOrderPendingToCustomer(order: Order): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: order.customer_email,
      subject: 'Your Gio\'s Corner Request is Pending Review',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Thank You for Your Order Request!</h2>
          
          <p>Hi ${order.customer_name},</p>
          
          <p>We've received your catering request for <strong>${order.date_needed}</strong> and it's currently pending review.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Order Summary</h3>
            <pre style="white-space: pre-wrap; font-family: monospace;">${formatFoodSelection(order)}</pre>
            <p><strong>Delivery Address:</strong><br/>${order.address}</p>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0c5460;">
            <p style="margin: 0;"><strong>What's Next?</strong></p>
            <p style="margin: 10px 0 0 0;">We'll review your request and get back to you shortly. You'll receive an email once your order is accepted or if we need to discuss any details.</p>
          </div>
          
          <p>If you have any questions, feel free to reply to this email.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br/>
            <strong>Gio's Corner Team</strong>
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Pending notification sent to customer ${order.customer_email}`);
    console.log('   Resend response:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ Failed to send pending notification to customer:', error);
    console.error('   Error details:', JSON.stringify(error, null, 2));
  }
}

/**
 * Send approval email to customer with proposed delivery time
 * Status: pending -> approved_pending_time
 */
export async function sendOrderApprovedToCustomer(order: Order): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: order.customer_email,
      subject: '✅ Your Gio\'s Corner Order is Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Great News! Your Order is Approved</h2>
          
          <p>Hi ${order.customer_name},</p>
          
          <p>We're excited to cater your event on <strong>${order.date_needed}</strong>!</p>
          
          ${order.approval_message ? `
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">Delivery Details</h3>
            <p style="margin: 0; white-space: pre-wrap;">${order.approval_message}</p>
          </div>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Order</h3>
            <pre style="white-space: pre-wrap; font-family: monospace;">${formatFoodSelection(order)}</pre>
            <p><strong>Delivery Address:</strong><br/>${order.address}</p>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0c5460;">
            <p style="margin: 0;"><strong>What's Next?</strong></p>
            <p style="margin: 10px 0 0 0;">Please reply to this email to confirm the delivery time works for you. Once confirmed, we'll send you an invoice for payment.</p>
          </div>
          
          <p>We look forward to serving you!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br/>
            <strong>Gio's Corner Team</strong>
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Approval email sent to customer ${order.customer_email}`);
    console.log('   Resend response:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ Failed to send approval email to customer:', error);
    console.error('   Error details:', JSON.stringify(error, null, 2));
    // Re-throw to ensure the error is visible in the Promise.all catch
    throw error;
  }
}

/**
 * Send payment link email to customer
 * Status: approved_pending_time -> invoice_sent
 */
export async function sendOrderInvoiceToCustomer(order: Order): Promise<void> {
  try {
    const totalPrice = order.total_price_cents ? formatPrice(order.total_price_cents) : 'TBD';
    
    await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: order.customer_email,
      subject: '💳 Payment Link for Your Gio\'s Corner Order',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Payment Ready for Your Order</h2>
          
          <p>Hi ${order.customer_name},</p>
          
          <p>Thank you for confirming the delivery time! Your order is ready for payment.</p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">Order Confirmed</h3>
            <p style="margin: 0;"><strong>Delivery Date:</strong> ${order.date_needed}</p>
            <p style="margin: 10px 0 0 0;"><strong>Total Amount:</strong> ${totalPrice}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Order</h3>
            <pre style="white-space: pre-wrap; font-family: monospace;">${formatFoodSelection(order)}</pre>
            <p><strong>Delivery Address:</strong><br/>${order.address}</p>
          </div>
          
          ${order.stripe_invoice_url ? `
          <div style="margin: 30px 0; text-align: center;">
            <a href="${order.stripe_invoice_url}" 
               style="background: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
              Pay Now
            </a>
          </div>
          
          <p style="color: #6c757d; font-size: 14px; text-align: center;">
            Please complete payment to finalize your order.
          </p>
          ` : ''}
          
          <p>We look forward to serving you!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br/>
            <strong>Gio's Corner Team</strong>
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Payment link email sent to customer ${order.customer_email}`);
  } catch (error) {
    console.error('❌ Failed to send payment link email to customer:', error);
  }
}

/**
 * Send denial email to customer with reason
 */
export async function sendOrderDeniedToCustomer(order: Order): Promise<void> {
  try {
    await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: order.customer_email,
      subject: 'Update on Your Gio\'s Corner Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Update on Your Catering Request</h2>
          
          <p>Hi ${order.customer_name},</p>
          
          <p>Thank you for your interest in Gio's Corner. Unfortunately, we're unable to fulfill your catering request for <strong>${order.date_needed}</strong>.</p>
          
          ${order.admin_reason ? `
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #856404;">
            <h3 style="margin-top: 0;">Reason</h3>
            <p style="margin: 0;">${order.admin_reason}</p>
          </div>
          ` : ''}
          
          <p>We apologize for any inconvenience. If you have questions or would like to discuss alternative options, please don't hesitate to reach out.</p>
          
          <p>We hope to serve you in the future!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br/>
            <strong>Gio's Corner Team</strong>
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Denial email sent to customer ${order.customer_email}`);
  } catch (error) {
    console.error('❌ Failed to send denial email to customer:', error);
  }
}

/**
 * Send confirmation to owner when order is approved
 */
export async function sendOrderApprovedToOwner(order: Order): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `✅ Order Approved - ${order.customer_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Order Approved Successfully</h2>
          
          <p>Order <strong>${order.id}</strong> has been approved and is pending time confirmation.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Date:</strong> ${order.date_needed}</p>
            ${order.approval_message ? `<p><strong>Message Sent:</strong><br/>${order.approval_message}</p>` : ''}
          </div>
          
          <p>Customer has been notified and asked to confirm the delivery time.</p>
        </div>
      `,
    });
    
    console.log(`✅ Approval confirmation sent to owner for order ${order.id}`);
    console.log('   Resend response:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ Failed to send approval confirmation to owner:', error);
    console.error('   Error details:', JSON.stringify(error, null, 2));
    // Re-throw to ensure the error is visible in the Promise.all catch
    throw error;
  }
}

/**
 * Send confirmation to owner when order is denied
 */
export async function sendOrderDeniedToOwner(order: Order): Promise<void> {
  try {
    await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `❌ Order Denied - ${order.customer_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Order Denied</h2>
          
          <p>Order <strong>${order.id}</strong> has been denied.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Date:</strong> ${order.date_needed}</p>
            ${order.admin_reason ? `<p><strong>Reason:</strong> ${order.admin_reason}</p>` : ''}
          </div>
          
          <p>Customer has been notified.</p>
        </div>
      `,
    });
    
    console.log(`✅ Denial confirmation sent to owner for order ${order.id}`);
  } catch (error) {
    console.error('❌ Failed to send denial confirmation to owner:', error);
  }
}

/**
 * Send catering interest notification to owner (tara@gioscorner.com)
 */
export async function sendCateringInterestNotification(customerEmail: string): Promise<void> {
  const CATERING_EMAIL = 'tara@gioscorner.com';
  
  try {
    const result = await resend.emails.send({
      from: `Gio's Corner <${FROM_EMAIL}>`,
      to: CATERING_EMAIL,
      subject: `🍽️ New Catering Menu Interest - ${customerEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2D3B2D;">New Catering Menu Interest</h2>
          
          <p>Someone has signed up to receive updates about the catering menu launch!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="color: #6c757d; font-size: 14px;">
            Add this email to your launch notification list.
          </p>
        </div>
      `,
    });
    
    console.log(`✅ Catering interest notification sent for ${customerEmail}`);
    console.log('   Resend response:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ Failed to send catering interest notification:', error);
    console.error('   Error details:', JSON.stringify(error, null, 2));
    throw error; // Re-throw so the API can return an error to the user
  }
}



