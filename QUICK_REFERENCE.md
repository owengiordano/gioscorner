# Quick Reference Guide - Menu Updates

## 🚀 Quick Start (3 Steps)

### Step 1: Run Database Migration
```sql
-- Open Supabase SQL Editor and run:
-- File: backend/migration-add-is-active.sql

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE menu_items SET is_active = true WHERE is_active IS NULL;
```

### Step 2: Deploy Frontend
```bash
cd frontend
npm run build
# Deploy your build folder
```

### Step 3: Test
1. Login to admin dashboard
2. Create a "Coming Soon" item
3. Visit menu page to see both sections

---

## 📋 What Changed?

| Feature | Before | After |
|---------|--------|-------|
| **Menu Header** | "Our Menu" | "Our Menu Items This Week" |
| **Order Form** | Inline on menu page | Separate `/order` page |
| **Coming Soon Items** | Not shown | New section below active items |
| **Admin Control** | N/A | Toggle between Active/Coming Soon |

---

## 🎯 Key Features

### For Customers:
- ✅ Browse active items in "Our Menu Items This Week"
- ✅ View upcoming items in "Coming Soon" section
- ✅ Click "Continue to Order" to go to order page
- ✅ Cannot order coming soon items (view only)

### For Admins:
- ✅ Toggle items between Active and Coming Soon
- ✅ Green badge = Active
- ✅ Yellow badge = Coming Soon
- ✅ Manage from Menu Management tab

---

## 🗂️ File Changes Summary

### New Files:
- ✅ `frontend/src/pages/Order.tsx` - New order page
- ✅ `backend/migration-add-is-active.sql` - Database migration
- ✅ `MENU_UPDATES_SUMMARY.md` - Detailed documentation
- ✅ `IMPLEMENTATION_CHECKLIST.md` - Deployment checklist
- ✅ `CHANGES_SUMMARY.md` - Visual overview
- ✅ `QUICK_REFERENCE.md` - This file

### Modified Files:
- ✅ `backend/supabase-schema.sql` - Added `is_active` field
- ✅ `backend/src/types/index.ts` - Added `is_active` to type
- ✅ `frontend/src/types/index.ts` - Added `is_active` to type
- ✅ `frontend/src/pages/Menu.tsx` - Split sections, removed form
- ✅ `frontend/src/pages/admin/Dashboard.tsx` - Added toggle
- ✅ `frontend/src/App.tsx` - Added `/order` route

---

## 🔍 How to Use

### Admin: Mark Item as Coming Soon
1. Admin Dashboard → Menu Management
2. Edit or create item
3. Set Status to "⏳ Coming Soon"
4. Save

### Admin: Activate a Coming Soon Item
1. Admin Dashboard → Menu Management
2. Find item with yellow "⏳ Coming Soon" badge
3. Click Edit
4. Set Status to "✓ Active (Available Now)"
5. Save

### Customer: Place Order
1. Menu page → Select items
2. Click "Continue to Order"
3. Fill form on Order page
4. Submit

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Coming soon items not showing | Verify `is_active = false` in database |
| Order button not working | Check browser console for errors |
| Admin toggle not saving | Verify admin token is valid |
| Items in wrong section | Check `is_active` value in database |

---

## 📞 Need Help?

1. Check `IMPLEMENTATION_CHECKLIST.md` for detailed steps
2. See `MENU_UPDATES_SUMMARY.md` for technical details
3. Review `CHANGES_SUMMARY.md` for visual overview

---

## ✅ Success Checklist

- [ ] Database migration completed
- [ ] Frontend deployed
- [ ] Can toggle items in admin
- [ ] Active items show in main section
- [ ] Coming soon items show in separate section
- [ ] Order flow works end-to-end
- [ ] Coming soon items cannot be ordered

---

**Status:** ✅ Ready for deployment
**Time to deploy:** ~5 minutes
**Breaking changes:** None


