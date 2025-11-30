import { stripe } from '../config/stripe';
import { Order } from '../types';

/**
 * Stripe Service
 * 
 * Handles Stripe invoice creation and payment processing.
 */

/**
 * Create a Stripe invoice for an accepted order
 * 
 * @param order - The order to create an invoice for
 * @param totalPriceCents - Total price in cents
 * @returns Object containing invoice ID and URL
 */
export async function createInvoiceForOrder(
  order: Order,
  totalPriceCents: number
): Promise<{ invoiceId: string; invoiceUrl: string }> {
  try {
    // Step 1: Create or retrieve customer
    const customers = await stripe.customers.list({
      email: order.customer_email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
      console.log(`Using existing Stripe customer: ${customer.id}`);
    } else {
      customer = await stripe.customers.create({
        email: order.customer_email,
        name: order.customer_name,
        address: {
          line1: order.address,
        },
        metadata: {
          order_id: order.id,
        },
      });
      console.log(`Created new Stripe customer: ${customer.id}`);
    }

    // Step 2: Create invoice item
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: totalPriceCents,
      currency: 'usd',
      description: `Gio's Corner Catering - ${order.date_needed}`,
      metadata: {
        order_id: order.id,
        date_needed: order.date_needed,
      },
    });

    // Step 3: Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: false, // Don't auto-finalize
      collection_method: 'send_invoice',
      days_until_due: 7,
      description: `Catering order for ${order.date_needed}`,
      metadata: {
        order_id: order.id,
        customer_name: order.customer_name,
      },
    });

    // Step 4: Finalize the invoice to make it payable
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    console.log(`✅ Created Stripe invoice ${finalizedInvoice.id} for order ${order.id}`);

    return {
      invoiceId: finalizedInvoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url || '',
    };
  } catch (error) {
    console.error('❌ Failed to create Stripe invoice:', error);
    throw new Error(`Failed to create Stripe invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieve invoice details from Stripe
 * 
 * @param invoiceId - Stripe invoice ID
 * @returns Invoice object
 */
export async function getInvoice(invoiceId: string) {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice;
  } catch (error) {
    console.error('❌ Failed to retrieve Stripe invoice:', error);
    throw new Error(`Failed to retrieve invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if an invoice has been paid
 * 
 * @param invoiceId - Stripe invoice ID
 * @returns Boolean indicating payment status
 */
export async function isInvoicePaid(invoiceId: string): Promise<boolean> {
  try {
    const invoice = await getInvoice(invoiceId);
    return invoice.status === 'paid';
  } catch (error) {
    console.error('❌ Failed to check invoice payment status:', error);
    return false;
  }
}



