-- Diagnostic: Check current order statuses
-- Run this FIRST to see what statuses exist in your database
-- This will help you understand what data you have before migrating

-- Show all unique statuses and their counts
SELECT 
  status, 
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as order_ids
FROM orders 
GROUP BY status 
ORDER BY count DESC;

-- Show sample orders for each status
SELECT 
  id,
  status,
  customer_name,
  created_at,
  updated_at
FROM orders 
ORDER BY created_at DESC
LIMIT 10;

