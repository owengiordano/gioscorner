# Order Workflow Implementation Summary

This document summarizes the implementation of the new order workflow for Gio's Corner.

## What Was Implemented

### New Order Statuses

The order workflow now supports 6 statuses instead of 3:

1. **pending** - Customer submitted order
2. **approved_pending_time** - Admin approved and proposed delivery time
3. **time_confirmed** - (Not directly used, transitions immediately to invoice_sent)
4. **invoice_sent** - Invoice sent to customer
5. **paid** - Invoice paid
6. **denied** - Order denied

### Database Changes

**File:** `backend/migration-update-order-statuses.sql`

- Updated order status constraint to include new statuses
- Added new columns:
  - `approval_message` - Message sent when approving order
  - `time_confirmed_at` - Timestamp when time was confirmed
  - `invoice_sent_at` - Timestamp when invoice was sent
  - `paid_at` - Timestamp when payment was received
- Added indexes for new timestamp columns
- Migration to update existing 'accepted' orders to 'paid'

**To apply:** Run this SQL in your Supabase SQL Editor

### Backend Changes

#### Types (`backend/src/types/index.ts`)
- Updated `Order` interface with new statuses and fields
- Renamed `AcceptOrderRequest` to `ApproveOrderRequest`
- Added `ConfirmTimeAndSendInvoiceRequest` interface

#### Order Service (`backend/src/services/orderService.ts`)
- **Removed:** `acceptOrder()` function
- **Added:** 
  - `approveOrder()` - Approve order and propose delivery time
  - `confirmTimeAndSendInvoice()` - Confirm time and send Stripe invoice
  - `markOrderAsPaid()` - Mark order as paid (manual or webhook)

#### Email Service (`backend/src/services/emailService.ts`)
- **Renamed:** `sendOrderAcceptedToCustomer()` → `sendOrderApprovedToCustomer()`
- **Renamed:** `sendOrderAcceptedToOwner()` → `sendOrderApprovedToOwner()`
- **Added:** `sendOrderInvoiceToCustomer()` - Send invoice email
- Updated email templates for new workflow

#### Admin Routes (`backend/src/routes/admin.ts`)
- **Removed:** `POST /api/admin/orders/:id/accept`
- **Added:**
  - `POST /api/admin/orders/:id/approve` - Approve order with message
  - `POST /api/admin/orders/:id/confirm-time-and-send-invoice` - Send invoice
  - `POST /api/admin/orders/:id/mark-paid` - Mark as paid manually
- Updated status validation to include new statuses

#### Validation (`backend/src/utils/validation.ts`)
- **Removed:** `validateAcceptOrder`
- **Added:**
  - `validateApproveOrder` - Validates approval message
  - `validateConfirmTimeAndSendInvoice` - Validates price for invoice

### Frontend Changes

#### Types (`frontend/src/types/index.ts`)
- Updated `Order` interface with new statuses and fields

#### API Service (`frontend/src/services/api.ts`)
- **Removed:** `acceptOrder()` function
- **Added:**
  - `approveOrder()` - Approve order with message
  - `confirmTimeAndSendInvoice()` - Confirm time and send invoice
  - `markOrderAsPaid()` - Mark order as paid
- Updated mock functions for dev mode
- Updated mock data to use new statuses

#### Admin Dashboard (`frontend/src/pages/admin/Dashboard.tsx`)
- **Removed:** Accept order button and handler
- **Added:**
  - Status filter buttons for all new statuses
  - Approval modal with message input
  - Confirm time modal with price input
  - Status-specific action buttons:
    - `pending` → "Approve & Propose Time" or "Deny"
    - `approved_pending_time` → "Mark Time Confirmed & Send Invoice"
    - `invoice_sent` → "Mark as Paid (Manual Override)"
    - `paid` → No actions (complete)
  - Display of approval message on order cards
  - Updated status badges with appropriate colors
  - Status-specific informational messages

### Documentation

Created comprehensive documentation:

1. **ENV_SETUP.md** - Complete guide for setting up environment variables
   - How to get Stripe keys
   - How to get Resend API key
   - How to get Supabase keys
   - Security best practices
   - Troubleshooting guide

2. **ORDER_WORKFLOW_GUIDE.md** - Complete workflow documentation
   - Detailed explanation of each status
   - Admin actions for each status
   - Email notifications
   - Common workflows
   - Best practices
   - Troubleshooting

3. **ORDER_WORKFLOW_IMPLEMENTATION.md** - This file

## Environment Variables Required

### Backend `.env`

```bash
# Existing variables (already documented)
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=admin@gioscorner.com
ADMIN_PASSWORD_HASH=your_bcrypt_hash
JWT_SECRET=your_jwt_secret

# NEW: Stripe keys (you mentioned you have these)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# NEW: Resend API key (you mentioned you have this)
RESEND_API_KEY=re_your_resend_api_key

# NEW: Owner email for notifications
OWNER_EMAIL=your_email@example.com
```

### Frontend `.env`

```bash
VITE_API_URL=http://localhost:3001
```

## Migration Steps

To deploy this new workflow:

### 1. Database Migration

```sql
-- Run backend/migration-update-order-statuses.sql in Supabase SQL Editor
```

### 2. Backend Setup

```bash
cd backend

# Add new environment variables to .env
# STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, RESEND_API_KEY, OWNER_EMAIL

# Install dependencies (if needed)
npm install

# Start backend
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# No new environment variables needed

# Install dependencies (if needed)
npm install

# Start frontend
npm run dev
```

### 4. Test the Workflow

1. Create a test order from the frontend
2. Log into admin dashboard
3. Test the approval flow:
   - Click "Approve & Propose Time"
   - Enter a message
   - Check that status changes to "approved_pending_time"
4. Test the invoice flow:
   - Click "Mark Time Confirmed & Send Invoice"
   - Enter a price
   - Check that status changes to "invoice_sent"
5. Test manual payment:
   - Click "Mark as Paid"
   - Check that status changes to "paid"
6. Test denial flow:
   - Create another order
   - Click "Deny Order"
   - Enter a reason
   - Check that status changes to "denied"

## Breaking Changes

⚠️ **Important:** This is a breaking change from the old workflow.

### What Changed

**Old Workflow:**
```
pending → accepted (invoice sent immediately) → denied
```

**New Workflow:**
```
pending → approved_pending_time → invoice_sent → paid
          ↓
        denied
```

### Migration of Existing Orders

The migration script automatically converts existing `accepted` orders to `paid` status. This assumes that if an order was accepted in the old system, it was likely paid.

If you have orders in the old system that were accepted but not yet paid, you may need to manually adjust their status in the database.

## API Changes

### Removed Endpoints

- `POST /api/admin/orders/:id/accept`

### New Endpoints

- `POST /api/admin/orders/:id/approve`
  - Body: `{ approval_message: string }`
  - Returns: Updated order

- `POST /api/admin/orders/:id/confirm-time-and-send-invoice`
  - Body: `{ total_price_cents?: number }`
  - Returns: Updated order with invoice details

- `POST /api/admin/orders/:id/mark-paid`
  - Body: (none)
  - Returns: Updated order

## Email Templates

All email templates have been updated to reflect the new workflow:

1. **Customer - Order Pending** (unchanged)
2. **Customer - Order Approved** (NEW - includes approval message)
3. **Customer - Invoice Sent** (NEW - includes invoice link)
4. **Customer - Order Denied** (unchanged)
5. **Admin - New Order** (unchanged)
6. **Admin - Order Approved** (NEW - confirmation of approval)
7. **Admin - Order Denied** (unchanged)

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can create new order from frontend
- [ ] Can approve order and send message
- [ ] Customer receives approval email
- [ ] Can confirm time and send invoice
- [ ] Stripe invoice is created
- [ ] Customer receives invoice email
- [ ] Can mark order as paid manually
- [ ] Can deny order with reason
- [ ] Customer receives denial email
- [ ] All status filters work correctly
- [ ] Order cards display correct information
- [ ] Modals open and close correctly
- [ ] No console errors

## Known Limitations

1. **Time confirmation is manual** - Admin must check email for customer's confirmation. There is no automated time confirmation in the UI.

2. **No webhook implementation yet** - Stripe webhook for automatic payment status updates needs to be set up separately (see DEPLOYMENT.md).

3. **No order editing** - Once an order is created, it cannot be edited. Admin must deny and ask customer to resubmit.

4. **No refund flow** - If a paid order needs to be refunded, this must be done manually in Stripe.

## Future Enhancements

Potential improvements for the future:

1. Add Stripe webhook handler for automatic payment status updates
2. Add ability to edit order details before sending invoice
3. Add order history/timeline view
4. Add refund workflow
5. Add ability to resend emails
6. Add SMS notifications
7. Add calendar view for delivery scheduling
8. Add customer order tracking page

## Support

For issues or questions:
1. Check ORDER_WORKFLOW_GUIDE.md for workflow questions
2. Check ENV_SETUP.md for configuration issues
3. Check backend logs for errors
4. Verify all environment variables are set correctly
5. Ensure database migration was applied

## Files Modified

### Backend
- `backend/migration-update-order-statuses.sql` (NEW)
- `backend/src/types/index.ts`
- `backend/src/services/orderService.ts`
- `backend/src/services/emailService.ts`
- `backend/src/routes/admin.ts`
- `backend/src/utils/validation.ts`

### Frontend
- `frontend/src/types/index.ts`
- `frontend/src/services/api.ts`
- `frontend/src/pages/admin/Dashboard.tsx`

### Documentation
- `ENV_SETUP.md` (NEW)
- `ORDER_WORKFLOW_GUIDE.md` (NEW)
- `ORDER_WORKFLOW_IMPLEMENTATION.md` (NEW - this file)

