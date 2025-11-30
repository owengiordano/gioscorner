# Order Workflow Guide

This document explains the complete order workflow for Gio's Corner, including all statuses, admin actions, and email notifications.

## Order Status Flow

```
pending
  ↓ (Admin: Approve & Propose Time)
approved_pending_time
  ↓ (Admin: Mark Time Confirmed & Send Invoice)
invoice_sent
  ↓ (Stripe webhook or Manual)
paid

OR

pending
  ↓ (Admin: Deny)
denied
```

## Detailed Status Breakdown

### 1. **pending** (Customer Submitted)

**What it means:** Customer has submitted an order request and is waiting for approval.

**Admin sees:**
- Full order details
- Customer information
- Special notes (if any)
- Two action buttons:
  - **Approve & Propose Time**
  - **Deny**

**Customer receives:**
- Confirmation email that order is pending review

**Admin receives:**
- New order notification email with all details

---

### 2. **approved_pending_time** (Approved, Waiting for Time Confirmation)

**What it means:** Admin has approved the order and proposed a delivery window. Waiting for customer to confirm via email.

**How to get here:**
1. Click "Approve & Propose Time" on a pending order
2. Enter a message proposing delivery time (e.g., "I can drop off between 5–6 PM")
3. Click "Approve & Send"

**Admin sees:**
- Order marked as "APPROVED (PENDING TIME)"
- The approval message that was sent
- Message: "⏳ Waiting for customer to confirm delivery time via email"
- One action button:
  - **Mark Time Confirmed & Send Invoice**

**Customer receives:**
- Email with approval message and proposed delivery time
- Request to reply to confirm the time works

**Admin receives:**
- Confirmation email that order was approved

**Next steps:**
- Wait for customer to reply to email confirming the time
- Once confirmed via email, proceed to next status

---

### 3. **invoice_sent** (Invoice Sent, Waiting for Payment)

**What it means:** Customer has confirmed the delivery time (via email), and the Stripe invoice has been sent.

**How to get here:**
1. Customer confirms delivery time via email (manually)
2. Admin clicks "Mark Time Confirmed & Send Invoice"
3. Admin enters the total price in cents
4. Click "Confirm & Send Invoice"

**Admin sees:**
- Order marked as "INVOICE SENT"
- Invoice URL link
- Total price
- Message: "💳 Invoice sent. Waiting for customer payment."
- One action button:
  - **Mark as Paid (Manual Override)** (for manual payments)

**Customer receives:**
- Email with Stripe invoice link
- Payment instructions

**Admin receives:**
- (No additional email at this stage)

**Next steps:**
- Wait for customer to pay invoice
- Stripe webhook will automatically update status to "paid" when payment is received
- Or admin can manually mark as paid if payment received outside Stripe

---

### 4. **paid** (Invoice Paid - Order Complete)

**What it means:** Customer has paid the invoice. Order is confirmed and ready for fulfillment.

**How to get here:**
- Automatically via Stripe webhook when customer pays
- OR manually by admin clicking "Mark as Paid"

**Admin sees:**
- Order marked as "PAID"
- Green success message: "✅ Order is paid and confirmed!"
- Payment timestamp
- No action buttons (order is complete)

**Customer receives:**
- Payment confirmation from Stripe

**Admin receives:**
- Payment notification from Stripe

**Next steps:**
- Fulfill the order on the delivery date
- No further action needed in the system

---

### 5. **denied** (Order Denied)

**What it means:** Admin has denied the order with a reason.

**How to get here:**
1. Click "Deny Order" on a pending order
2. Enter a denial reason (e.g., "Sorry, we're fully booked on that date")
3. Click "Deny Order"

**Admin sees:**
- Order marked as "DENIED"
- Denial reason displayed
- No action buttons

**Customer receives:**
- Email explaining the order was denied with the reason

**Admin receives:**
- Confirmation email that order was denied

**Next steps:**
- None (order is closed)

---

## Admin Dashboard Features

### Status Filter Buttons

The dashboard has filter buttons to view orders by status:
- **Pending** (yellow) - New orders needing review
- **Approved (Pending Time)** (blue) - Approved, waiting for time confirmation
- **Invoice Sent** (purple) - Invoice sent, waiting for payment
- **Paid** (green) - Completed orders
- **Denied** (red) - Denied orders
- **All Orders** (primary) - View everything

### Order Card Information

Each order card displays:
- Customer name and email
- Status badge (color-coded)
- Date needed
- Order date/time
- Delivery address
- Food selection with quantities and notes
- Special notes (highlighted in yellow box)
- Total price (when available)
- Stripe invoice link (when available)
- Approval message (when available)
- Denial reason (when available)
- Appropriate action buttons based on status

---

## Email Notifications

### For Customers

1. **Order Pending** (status: pending)
   - Subject: "Your Gio's Corner Request is Pending Review"
   - Content: Order summary, what to expect next

2. **Order Approved** (status: approved_pending_time)
   - Subject: "✅ Your Gio's Corner Order is Approved!"
   - Content: Approval message with proposed delivery time, request to confirm

3. **Invoice Sent** (status: invoice_sent)
   - Subject: "💳 Invoice for Your Gio's Corner Order"
   - Content: Order confirmed, invoice link, payment instructions

4. **Order Denied** (status: denied)
   - Subject: "Update on Your Gio's Corner Request"
   - Content: Denial reason, apology, contact information

### For Admin (Owner)

1. **New Order** (status: pending)
   - Subject: "🔔 New Order from [Customer Name] - Pending Review"
   - Content: Full order details, link to admin dashboard

2. **Order Approved** (status: approved_pending_time)
   - Subject: "✅ Order Approved - [Customer Name]"
   - Content: Confirmation with approval message sent

3. **Order Denied** (status: denied)
   - Subject: "❌ Order Denied - [Customer Name]"
   - Content: Confirmation with denial reason

---

## Important Notes

### Time Confirmation Process

**The delivery time is NOT entered in the admin panel.** Here's how it works:

1. Admin approves order and types a message proposing a delivery window
2. Customer receives email and replies to confirm
3. Admin manually checks email for customer's confirmation
4. Once confirmed via email, admin clicks "Mark Time Confirmed & Send Invoice"
5. System creates and sends Stripe invoice

**Why this approach?**
- Allows flexible back-and-forth communication via email
- No need to build complex scheduling UI
- More personal customer service
- Admin has full control over timing

### Manual vs Automatic Payment Status

**Automatic (Recommended):**
- Stripe webhook automatically updates status to "paid" when customer pays
- Requires webhook setup (see DEPLOYMENT.md)

**Manual:**
- Admin can click "Mark as Paid" to manually update status
- Useful for:
  - Cash payments
  - Check payments
  - Venmo/PayPal payments
  - Testing without actual payment

### Price Entry

- Price is entered when creating the invoice (at the "invoice_sent" stage)
- Enter price in **cents** (e.g., 5000 for $50.00)
- System shows a preview: "Current: $50.00"
- If not specified, system will auto-calculate from menu items

---

## Common Workflows

### Standard Order Flow

1. Customer submits order → **pending**
2. Admin reviews and clicks "Approve & Propose Time"
3. Admin types: "I can drop off between 5–6 PM" → **approved_pending_time**
4. Customer replies to email: "5 PM works great!"
5. Admin clicks "Mark Time Confirmed & Send Invoice"
6. Admin enters price: 5000 cents → **invoice_sent**
7. Customer pays invoice via Stripe → **paid**
8. Admin fulfills order on delivery date ✅

### Quick Denial Flow

1. Customer submits order → **pending**
2. Admin reviews and clicks "Deny Order"
3. Admin types: "Sorry, we're fully booked that week" → **denied**
4. Customer receives denial email ❌

### Manual Payment Flow

1. Follow standard flow through **invoice_sent**
2. Customer pays via Venmo/cash instead of Stripe
3. Admin clicks "Mark as Paid (Manual Override)" → **paid**
4. Admin fulfills order on delivery date ✅

---

## Troubleshooting

### "Order is already [status]" error
- You can only perform actions on orders in the correct status
- Check the current status and use the appropriate action
- Example: Can't approve an order that's already approved

### Customer didn't receive email
- Check spam folder
- Verify email address is correct
- Check Resend dashboard for delivery status
- Verify RESEND_API_KEY is set correctly

### Invoice not created
- Check STRIPE_SECRET_KEY is set correctly
- Verify Stripe account is active
- Check backend logs for specific error
- Make sure price is greater than 0

### Can't mark as paid
- Order must be in "invoice_sent" status first
- If invoice wasn't sent, go back and send it
- Or contact customer to pay the invoice

---

## Best Practices

1. **Respond Quickly:** Try to approve/deny orders within 24 hours
2. **Be Specific:** When proposing delivery times, give clear windows (e.g., "5-6 PM" not "afternoon")
3. **Check Email:** Monitor your email for customer time confirmations
4. **Verify Payments:** Double-check Stripe dashboard for payment confirmations
5. **Keep Notes:** Use the order notes section to track any special requests
6. **Plan Ahead:** Use the "Date Needed" field to organize your delivery schedule

---

## Questions?

If you have questions about the workflow:
1. Check this guide first
2. Review the ENV_SETUP.md for configuration issues
3. Check the backend logs for errors
4. Verify all environment variables are set correctly

