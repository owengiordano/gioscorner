-- Migration: Add promo_codes table
-- Run this in your Supabase SQL Editor

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Promo code details
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  
  -- Usage limits
  max_uses INTEGER, -- NULL means unlimited
  current_uses INTEGER DEFAULT 0,
  
  -- Validity period
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- NULL means no expiration
  
  -- Status
  is_active BOOLEAN DEFAULT true
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON promo_codes(is_active);

-- Create updated_at trigger for promo_codes
CREATE TRIGGER update_promo_codes_updated_at 
  BEFORE UPDATE ON promo_codes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can manage promo codes" ON promo_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE promo_codes IS 'Promo codes for discounts on catering orders';
COMMENT ON COLUMN promo_codes.discount_percent IS 'Percentage discount (1-100)';
COMMENT ON COLUMN promo_codes.max_uses IS 'Maximum number of times this code can be used (NULL = unlimited)';
COMMENT ON COLUMN promo_codes.current_uses IS 'Number of times this code has been used';

-- Add promo_code_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percent INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_price_cents INTEGER;

-- Create index on promo_code_id for orders
CREATE INDEX IF NOT EXISTS idx_orders_promo_code_id ON orders(promo_code_id);

COMMENT ON COLUMN orders.promo_code_id IS 'Reference to the promo code used for this order';
COMMENT ON COLUMN orders.discount_percent IS 'Discount percentage applied to this order';
COMMENT ON COLUMN orders.original_price_cents IS 'Original price before discount was applied';
