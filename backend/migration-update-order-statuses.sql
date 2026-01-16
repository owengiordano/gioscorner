-- Migration: Update order statuses for new workflow
-- Run this in your Supabase SQL Editor

-- Update the orders table to support new statuses
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_status_check;

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

-- Add new fields for the workflow
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS approval_message TEXT,
  ADD COLUMN IF NOT EXISTS time_confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add comments for new columns
COMMENT ON COLUMN orders.approval_message IS 'Message sent to customer when order is approved (e.g., proposed delivery window)';
COMMENT ON COLUMN orders.time_confirmed_at IS 'Timestamp when customer confirmed the delivery time';
COMMENT ON COLUMN orders.invoice_sent_at IS 'Timestamp when Stripe invoice was sent';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when invoice was paid';

-- Update existing 'accepted' orders to 'paid' status (if any exist)
-- This is a one-time migration for existing data
UPDATE orders 
SET status = 'paid', 
    paid_at = updated_at 
WHERE status = 'accepted' AND stripe_invoice_id IS NOT NULL;

-- Create index on new timestamp columns for queries
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_sent_at ON orders(invoice_sent_at DESC);



