# Database Migration Troubleshooting

## Error: "check constraint orders_status_check is violated by some row"

This error means you have existing orders in your database with statuses that don't match the new constraint.

### Solution: Use the Safe Migration Script

Follow these steps in order:

---

## Step 1: Check Current Statuses

First, let's see what statuses currently exist in your database.

**Run this in Supabase SQL Editor:**

```sql
-- Copy and paste from: backend/check-current-statuses.sql
SELECT 
  status, 
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as order_ids
FROM orders 
GROUP BY status 
ORDER BY count DESC;
```

This will show you something like:
```
status    | count | order_ids
----------|-------|----------
pending   | 5     | uuid1, uuid2, uuid3...
accepted  | 3     | uuid4, uuid5, uuid6...
denied    | 1     | uuid7
```

---

## Step 2: Run the Safe Migration

Now run the safe migration script that handles existing data:

**Copy and paste the entire contents of:**
`backend/migration-update-order-statuses-safe.sql`

This script will:
1. ✅ Add new columns first
2. ✅ Convert `accepted` orders to `paid`
3. ✅ Convert any unexpected statuses to `pending`
4. ✅ Update the constraint safely
5. ✅ Add indexes
6. ✅ Show you the results

---

## Step 3: Verify the Migration

After running the migration, you should see output like:

```
status                  | count
------------------------|------
pending                 | 5
paid                    | 3
denied                  | 1
```

All orders should now have valid statuses!

---

## What the Safe Migration Does

### Existing Status Conversions

| Old Status | New Status | Reason |
|------------|------------|--------|
| `accepted` | `paid` | Assumes accepted orders were completed |
| `anything else` | `pending` | Safe default for unexpected statuses |
| `pending` | `pending` | No change needed |
| `denied` | `denied` | No change needed |

### New Columns Added

- `approval_message` - Stores the delivery time proposal
- `time_confirmed_at` - Timestamp when time was confirmed
- `invoice_sent_at` - Timestamp when invoice was sent
- `paid_at` - Timestamp when payment was received

---

## If You Have Custom Statuses

If you have orders with custom statuses that you want to preserve differently:

### Option 1: Manual Update Before Migration

```sql
-- Example: Convert 'in_progress' to 'pending'
UPDATE orders 
SET status = 'pending'
WHERE status = 'in_progress';

-- Example: Convert 'completed' to 'paid'
UPDATE orders 
SET status = 'paid', paid_at = updated_at
WHERE status = 'completed';

-- Then run the safe migration script
```

### Option 2: Modify the Safe Migration

Edit `migration-update-order-statuses-safe.sql` and add your custom conversions in Step 2:

```sql
-- Add your custom conversions here
UPDATE orders 
SET status = 'paid', paid_at = updated_at
WHERE status = 'your_custom_status';
```

---

## Common Issues

### Issue: "Column already exists"

**Error:** `column "approval_message" of relation "orders" already exists`

**Solution:** You've already run part of the migration. Run this to check:

```sql
-- Check which columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('approval_message', 'time_confirmed_at', 'invoice_sent_at', 'paid_at');
```

Then run only the parts of the migration you need.

---

### Issue: "Constraint already exists"

**Error:** `constraint "orders_status_check" already exists`

**Solution:** The constraint was already updated. Check current constraint:

```sql
-- Check current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'orders_status_check';
```

If it shows the old statuses, drop and recreate:

```sql
ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'approved_pending_time', 'time_confirmed', 'invoice_sent', 'paid', 'denied'));
```

---

### Issue: Still getting constraint violation

**Error:** Still getting "check constraint is violated"

**Solution:** There's still data that doesn't match. Find it:

```sql
-- Find orders with invalid statuses
SELECT id, status, customer_name, created_at
FROM orders
WHERE status NOT IN ('pending', 'approved_pending_time', 'time_confirmed', 'invoice_sent', 'paid', 'denied');
```

Then update those specific orders:

```sql
-- Update invalid orders to pending
UPDATE orders 
SET status = 'pending'
WHERE status NOT IN ('pending', 'approved_pending_time', 'time_confirmed', 'invoice_sent', 'paid', 'denied');
```

---

## Nuclear Option: Fresh Start

If you're in development and don't care about existing orders:

```sql
-- ⚠️ WARNING: This deletes ALL orders!
-- Only use this in development!

TRUNCATE TABLE orders CASCADE;

-- Then run the safe migration script
```

---

## Rollback (If Needed)

If something goes wrong and you need to rollback:

```sql
-- Rollback: Restore old constraint
ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'accepted', 'denied'));

-- Convert paid back to accepted
UPDATE orders SET status = 'accepted' WHERE status = 'paid';

-- Remove new columns (optional)
ALTER TABLE orders 
  DROP COLUMN IF EXISTS approval_message,
  DROP COLUMN IF EXISTS time_confirmed_at,
  DROP COLUMN IF EXISTS invoice_sent_at,
  DROP COLUMN IF EXISTS paid_at;
```

---

## After Successful Migration

Once the migration succeeds:

1. ✅ Restart your backend server
2. ✅ Test creating a new order
3. ✅ Test approving an order
4. ✅ Test the full workflow

---

## Quick Migration Checklist

- [ ] Run `check-current-statuses.sql` to see existing data
- [ ] Run `migration-update-order-statuses-safe.sql`
- [ ] Verify results (should show count by status)
- [ ] Check for any errors
- [ ] Restart backend server
- [ ] Test the workflow

---

## Need More Help?

If you're still stuck:

1. **Check what statuses you have:**
   ```sql
   SELECT DISTINCT status FROM orders;
   ```

2. **Share the output** and I can help you create a custom migration

3. **Check backend logs** after restarting to see if there are any other issues

---

## Files Reference

- `backend/check-current-statuses.sql` - Diagnostic query
- `backend/migration-update-order-statuses-safe.sql` - Safe migration (USE THIS ONE)
- `backend/migration-update-order-statuses.sql` - Original migration (DON'T USE)

