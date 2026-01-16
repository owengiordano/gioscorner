# Mock Orders Guide

This guide explains how to add and manage mock orders for testing the admin portal.

## Quick Start

### Add Mock Orders

```bash
cd backend
node add-mock-orders.js
```

This creates 10 mock orders with:
- **4 Pending orders** - Orders awaiting admin review
- **4 Accepted orders** - Orders that have been approved with Stripe invoices
- **2 Denied orders** - Orders that have been rejected with reasons

### View Orders

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to the admin portal at `http://localhost:5173/admin`

4. Login with your admin credentials (from `.env` file)

5. View the mock orders on the dashboard

## Mock Order Details

The script creates orders with realistic data:

### Pending Orders (4)
1. **Sarah Johnson** - Birthday party, 7 days out
   - 2x Family Dinner Meal
   - 1x Dessert Platter
   
2. **Emily Rodriguez** - Office lunch, 3 days out
   - 3x Sandwich Box
   
3. **Robert Williams** - Family reunion, 21 days out
   - 3x Family Dinner Meal
   - 1x Party Platter
   - 1x Dessert Platter
   
4. **Lisa Anderson** - Wedding reception, 30 days out
   - 2x Pasta Bar
   - 3x Dessert Platter

### Accepted Orders (4)
1. **Michael Chen** - Corporate event, 14 days out
   - Total: $300.00
   - Mock Stripe invoice included
   
2. **David Thompson** - Graduation party, 10 days out
   - Total: $350.00
   - Mock Stripe invoice included
   
3. **Amanda Lee** - Baby shower, 5 days out
   - Total: $160.00
   - Mock Stripe invoice included
   
4. **James Wilson** - Company picnic, 15 days out
   - Total: $345.00
   - Mock Stripe invoice included

### Denied Orders (2)
1. **Jessica Martinez** - Small gathering, 2 days out
   - Reason: "Unfortunately, we are fully booked for that date."
   
2. **Christopher Brown** - Last minute order, 1 day out
   - Reason: "We require at least 48 hours notice for all catering orders."

## Clear All Orders

If you need to reset the database:

```bash
cd backend
node clear-mock-orders.js
```

⚠️ **WARNING**: This will delete ALL orders from the database, including any real orders. Use only in development!

## Customizing Mock Data

To customize the mock orders, edit `backend/add-mock-orders.js`:

1. **Change customer details**: Edit the `customer_name`, `customer_email`, and `address` fields
2. **Modify food selections**: Update the `food_selection` array with different menu items
3. **Adjust dates**: Change the `getDaysFromNow()` parameter to set different order dates
4. **Update statuses**: Change `status` to 'pending', 'accepted', or 'denied'
5. **Add more orders**: Copy an existing order object and modify it

### Available Menu Items

- `family-dinner-meal` - $50.00 (serves 4)
- `party-platter` - $75.00 (serves 8)
- `sandwich-box` - $120.00 (serves 10)
- `pasta-bar` - $150.00 (serves 15)
- `taco-bar` - $135.00 (serves 12)
- `dessert-platter` - $40.00 (serves 8)

## Troubleshooting

### "Missing Supabase configuration" error

Make sure your `backend/.env` file has:
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
```

### Orders not showing in admin portal

1. Check that the backend server is running
2. Verify you're logged in as admin
3. Try refreshing the page
4. Check the browser console for errors

### Want to add more orders

Just run `node add-mock-orders.js` again! It will add 10 more orders each time you run it.

## Related Files

- `backend/add-mock-orders.js` - Script to add mock orders
- `backend/clear-mock-orders.js` - Script to clear all orders
- `backend/src/services/orderService.ts` - Order business logic
- `backend/supabase-schema.sql` - Database schema
- `frontend/src/pages/admin/Dashboard.tsx` - Admin dashboard UI




