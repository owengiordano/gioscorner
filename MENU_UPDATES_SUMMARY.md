# Menu Page Updates Summary

## Overview
This document summarizes the changes made to implement the following features:
1. Separate "Our Menu Items This Week" section showing only active items
2. "Continue to Order" button that navigates to a dedicated order page
3. "Coming Soon" section showing inactive menu items
4. Admin toggle to mark items as Active or Coming Soon

## Changes Made

### 1. Database Schema Updates

**File:** `backend/supabase-schema.sql`
- Added `is_active BOOLEAN DEFAULT true` field to the `menu_items` table
- This field determines whether an item appears in the active menu or coming soon section

**Migration File:** `backend/migration-add-is-active.sql`
- Run this SQL script in your Supabase SQL Editor to add the `is_active` field to your existing database
- All existing items will default to `is_active = true`

### 2. Frontend Type Updates

**File:** `frontend/src/types/index.ts`
- Added `is_active?: boolean` to the `MenuItem` interface

### 3. New Order Page

**File:** `frontend/src/pages/Order.tsx` (NEW)
- Created a dedicated order page that handles the order form
- Receives selected items via navigation state from the Menu page
- Shows order summary with total price
- Handles form submission and validation
- Redirects back to menu if no items are selected

**File:** `frontend/src/App.tsx`
- Added route for `/order` page
- Imported the new `Order` component

### 4. Menu Page Updates

**File:** `frontend/src/pages/Menu.tsx`
- Removed inline order form (moved to separate Order page)
- Split menu items into two sections:
  - **Active Items**: Items where `is_active !== false` (shown in main section)
  - **Coming Soon Items**: Items where `is_active === false` (shown in separate section below)
- Updated header to "Our Menu Items This Week"
- Changed "Continue to Order Form" button to "Continue to Order" which navigates to `/order` page
- Added "Coming Soon" section with:
  - Separate heading and description
  - Visual badge indicating "Coming Soon" status
  - Slightly reduced opacity to distinguish from active items
  - Same interactive features (carousel, modal details)

### 5. Admin Dashboard Updates

**File:** `frontend/src/pages/admin/Dashboard.tsx`
- Added `is_active` field to menu form state (defaults to `true`)
- Added "Status" toggle in the menu item form with two options:
  - **✓ Active (Available Now)**: Item appears in main menu
  - **⏳ Coming Soon**: Item appears in "Coming Soon" section
- Added status badge to menu item cards in the admin list showing whether item is Active or Coming Soon
- Visual indicators use color coding (green for active, yellow for coming soon)

## How to Use

### For Admins:

1. **Run the Migration**:
   - Go to your Supabase SQL Editor
   - Run the SQL in `backend/migration-add-is-active.sql`
   - This adds the `is_active` field to existing menu items

2. **Manage Menu Items**:
   - Go to Admin Dashboard → Menu Management
   - When creating or editing a menu item, use the "Status" toggle to set:
     - **Active**: Item will appear in the main "Our Menu Items This Week" section
     - **Coming Soon**: Item will appear in the "Coming Soon" section below
   - The status badge on each menu card shows the current state

### For Customers:

1. **Browse Menu**:
   - Visit the Menu page to see "Our Menu Items This Week"
   - Active items appear in the main section
   - Select quantities for items you want to order

2. **Place Order**:
   - Click "Continue to Order" button
   - You'll be taken to a dedicated order page
   - Review your selection and fill out the order form
   - Submit your order

3. **Coming Soon Items**:
   - Scroll down to see "Coming Soon" section
   - These items are not yet available for ordering
   - Click on items to view details and get excited about future offerings!

## Technical Notes

### Navigation State
The Menu page passes the `foodSelection` array to the Order page via React Router's navigation state:
```typescript
navigate('/order', { state: { foodSelection } });
```

### Filtering Logic
Menu items are filtered based on the `is_active` field:
```typescript
const activeItems = menuItems.filter(item => item.is_active !== false);
const comingSoonItems = menuItems.filter(item => item.is_active === false);
```

### Backward Compatibility
- If `is_active` is `undefined` or `true`, the item is treated as active
- Only items explicitly set to `is_active = false` appear in "Coming Soon"
- This ensures existing items without the field continue to work normally

## Files Modified

### Backend:
- `backend/supabase-schema.sql` - Added `is_active` field
- `backend/migration-add-is-active.sql` - NEW migration file

### Frontend:
- `frontend/src/types/index.ts` - Added `is_active` to MenuItem type
- `frontend/src/pages/Menu.tsx` - Split into active/coming soon sections, removed inline form
- `frontend/src/pages/Order.tsx` - NEW dedicated order page
- `frontend/src/pages/admin/Dashboard.tsx` - Added is_active toggle
- `frontend/src/App.tsx` - Added /order route

## Next Steps

1. Run the migration SQL in your Supabase database
2. Test the new flow:
   - Create a menu item and mark it as "Coming Soon"
   - Verify it appears in the Coming Soon section on the Menu page
   - Toggle it to "Active" and verify it moves to the main section
   - Test the order flow by selecting items and clicking "Continue to Order"
3. Populate your menu with both active and coming soon items




