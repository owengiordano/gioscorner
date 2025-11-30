-- Migration: Add is_active field to menu_items table
-- Run this in your Supabase SQL Editor to add the new is_active field

-- Add the is_active column (defaults to true for existing items)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add a comment to document the field
COMMENT ON COLUMN menu_items.is_active IS 'Whether item is currently active (true) or coming soon (false)';

-- Update any existing items to be active by default
UPDATE menu_items 
SET is_active = true 
WHERE is_active IS NULL;

-- Optional: Set specific items to "coming soon" status
-- Uncomment and modify the following line to mark specific items as coming soon:
-- UPDATE menu_items SET is_active = false WHERE id IN ('item-id-1', 'item-id-2');


