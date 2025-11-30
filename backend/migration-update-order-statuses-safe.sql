-- Migration: Update order statuses for new workflow (SAFE VERSION)
-- This version handles existing data before updating constraints
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns first (before touching constraints)
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS approval_message TEXT,
  ADD COLUMN IF NOT EXISTS time_confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Step 2: DROP the old constraint FIRST (before updating data)
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 3: Now update existing data (no constraint to violate)
-- Convert 'accepted' orders to 'paid' (assuming they were completed)
UPDATE orders 
SET status = 'paid', 
    paid_at = updated_at 
WHERE status = 'accepted';

-- If you have any other unexpected statuses, convert them to 'pending'
UPDATE orders 
SET status = 'pending'
WHERE status NOT IN ('pending', 'denied', 'paid');

-- Step 4: Add the NEW constraint with all the new statuses
ALTER TABLE orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    'pending',
    'approved_pending_time',
    'time_confirmed',
    'invoice_sent',
    'paid',
    'denied'
  ));

-- Step 5: Add comments for new columns
COMMENT ON COLUMN orders.approval_message IS 'Message sent to customer when order is approved (e.g., proposed delivery window)';
COMMENT ON COLUMN orders.time_confirmed_at IS 'Timestamp when customer confirmed the delivery time';
COMMENT ON COLUMN orders.invoice_sent_at IS 'Timestamp when Stripe invoice was sent';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when invoice was paid';

-- Step 6: Create indexes on new timestamp columns for queries
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_sent_at ON orders(invoice_sent_at DESC);

-- Step 7: Verify the migration
-- This will show you the count of orders by status
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status 
ORDER BY status;

