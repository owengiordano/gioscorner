import { stripe } from '../config/stripe';
import { Order } from '../types';

/**
 * Stripe Service
 * 
 * Handles Stripe payment link creation and payment processing.
 */

/**
 * Create a Stripe Payment Link for an accepted order
 * 
 * @param order - The order to create a payment link for
 * @param totalPriceCents - Total price in cents
 * @returns Object containing payment link ID and URL
 */
export async function createPaymentLinkForOrder(
  order: Order,
  totalPriceCents: number
): Promise<{ paymentLinkId: string; paymentLinkUrl: string }> {
  try {
    // Build product name with discount info if applicable
    let productName = `Gio's Corner Catering - ${order.date_needed}`;
    if (order.discount_percent && order.discount_percent > 0) {
      productName += ` (${order.discount_percent}% discount applied)`;
    }

    // Step 1: Create a one-time price for this order
    const price = await stripe.prices.create({
      unit_amount: totalPriceCents,
      currency: 'usd',
      product_data: {
        name: productName,
        metadata: {
          order_id: order.id,
          customer_name: order.customer_name,
          date_needed: order.date_needed,
          discount_percent: order.discount_percent?.toString() || '0',
        },
      },
    });

    console.log(`Created Stripe price: ${price.id}`);

    // Step 2: Create a payment link with the price
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        date_needed: order.date_needed,
      },
      // Pre-fill customer email if possible
      custom_fields: [],
      // Allow customer to adjust quantity? No - it's a fixed order
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-confirmed?order_id=${order.id}`,
        },
      },
    });

    console.log(`✅ Created Stripe payment link ${paymentLink.id} for order ${order.id}`);

    return {
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.url,
    };
  } catch (error) {
    console.error('❌ Failed to create Stripe payment link:', error);
    throw new Error(`Failed to create Stripe payment link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieve payment link details from Stripe
 * 
 * @param paymentLinkId - Stripe payment link ID
 * @returns Payment link object
 */
export async function getPaymentLink(paymentLinkId: string) {
  try {
    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
    return paymentLink;
  } catch (error) {
    console.error('❌ Failed to retrieve Stripe payment link:', error);
    throw new Error(`Failed to retrieve payment link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deactivate a payment link (e.g., if order is cancelled)
 * 
 * @param paymentLinkId - Stripe payment link ID
 */
export async function deactivatePaymentLink(paymentLinkId: string): Promise<void> {
  try {
    await stripe.paymentLinks.update(paymentLinkId, {
      active: false,
    });
    console.log(`✅ Deactivated payment link ${paymentLinkId}`);
  } catch (error) {
    console.error('❌ Failed to deactivate payment link:', error);
  }
}





