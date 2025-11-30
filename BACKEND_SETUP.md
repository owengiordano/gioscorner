# Backend Setup Guide

## ✅ What's Been Completed

### 1. Database Schema
- **Menu Items Table**: Added complete schema for `menu_items` table with:
  - Core fields: `id`, `name`, `description`, `bio`, `detailed_info`, `price_cents`, `category`, `serves`
  - Visual features: `image_colors` array for placeholder gradients
  - Management fields: `display_order`, `is_available`
  - **Scheduling**: `available_days` array (0=Sunday through 6=Saturday) to restrict which days items can be ordered for
  - Automatic timestamps with triggers
  - Row Level Security (RLS) policies
  - Performance indexes on `category` and `display_order`
  - Default data for 6 menu items (all available every day by default)

### 2. Backend Services
- **Menu Service** (`backend/src/services/menuService.ts`):
  - `getAllMenuItems()` - Get available menu items for public
  - `getAllMenuItemsAdmin()` - Get all menu items including unavailable (admin only)
  - `getMenuItemById(id)` - Get single menu item
  - `createMenuItem(data)` - Create new menu item
  - `updateMenuItem(id, updates)` - Update existing menu item
  - `deleteMenuItem(id)` - Delete menu item
  - `calculateTotalPrice(foodSelection)` - Calculate order totals from database prices

### 3. Backend Routes
- **Public Menu Route** (`/api/menu`):
  - `GET /api/menu` - Fetch available menu items from database

- **Admin Menu Routes** (`/api/admin/menu`):
  - `GET /api/admin/menu` - Get all menu items (including unavailable)
  - `GET /api/admin/menu/:id` - Get single menu item
  - `POST /api/admin/menu` - Create new menu item
  - `PUT /api/admin/menu/:id` - Update menu item
  - `DELETE /api/admin/menu/:id` - Delete menu item

### 4. Frontend Integration
- **API Service** (`frontend/src/services/api.ts`):
  - Added `getMenuItems()` - Admin endpoint to fetch all menu items
  - Added `getMenuItemById(itemId)` - Get single item
  - Added `createMenuItem(data)` - Create new item
  - Added `updateMenuItem(itemId, updates)` - Update item
  - Added `deleteMenuItem(itemId)` - Delete item

- **Admin Dashboard** (`frontend/src/pages/admin/Dashboard.tsx`):
  - Connected menu management tab to real API
  - Full CRUD operations for menu items
  - Day-of-week selector for scheduling menu item availability
  - Form validation and error handling
  - Loading states and user feedback

- **Menu Page** (`frontend/src/pages/Menu.tsx`):
  - Displays available days badge on menu items with restricted schedules
  - Date picker validation based on selected items
  - Automatic intersection of available days when multiple items are selected
  - Clear error messages when invalid dates are selected
  - Visual indicators for day restrictions

### 5. Type Definitions
- Updated `MenuItem` interface in both backend and frontend to include:
  - `created_at`, `updated_at` timestamps
  - `display_order` for custom sorting
  - `is_available` for toggling visibility
  - `available_days` array for day-of-week scheduling

### 6. Database Connection
- **Singleton Pattern**: The Supabase client is created once in `backend/src/config/database.ts` and exported
- All services import the same client instance
- No connection pooling issues - one connection per server deployment ✅

## 🚀 Next Steps to Get Backend Running

### Step 1: Run the Database Schema
1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy the entire contents of `backend/supabase-schema.sql`
4. Paste and run the query
5. Verify both tables are created:
   - `menu_items` (should have 6 default items)
   - `orders` (should be empty)

### Step 2: Set Up Environment Variables
Create `backend/.env` file with:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Admin Credentials
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_password

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Install Dependencies
```bash
cd backend
npm install
```

### Step 4: Start the Backend Server
```bash
npm run dev
```

The server should start on `http://localhost:3001`

### Step 5: Test the Backend
1. **Health Check**: Visit `http://localhost:3001/api/health`
2. **Menu Items**: Visit `http://localhost:3001/api/menu`
   - Should return the 6 default menu items from the database
3. **Admin Login**: Use Postman or curl to test admin login

### Step 6: Start the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and test:
- Menu page should show items from database
- Admin dashboard should allow full menu management

## 🔍 Verification Checklist

- [ ] Database schema applied successfully
- [ ] Both tables (`menu_items` and `orders`) exist in Supabase
- [ ] Default menu items are visible in Supabase table editor
- [ ] Backend `.env` file configured with all required variables
- [ ] Backend server starts without errors
- [ ] `/api/health` endpoint returns 200 OK
- [ ] `/api/menu` endpoint returns menu items from database
- [ ] Frontend can fetch and display menu items
- [ ] Admin can login to dashboard
- [ ] Admin can view all menu items
- [ ] Admin can create new menu items
- [ ] Admin can edit existing menu items
- [ ] Admin can delete menu items
- [ ] Changes in admin dashboard reflect immediately

## 📝 Important Notes

### Database Connection
- ✅ **Single Connection**: The Supabase client is created once and reused
- ✅ **No Pooling Issues**: Each server deployment uses one client instance
- ✅ **Service Role**: Backend uses service role key to bypass RLS

### Menu Items vs Config File
- The hardcoded menu in `backend/src/config/menu.ts` is **no longer used**
- All menu data now comes from the database
- You can safely ignore or delete that file if you want
- Menu management is now done through the admin dashboard

### Security
- Public users can only see `is_available = true` items
- Admin endpoints require JWT authentication
- Service role bypasses RLS for admin operations

### Future Enhancements
- Add image upload functionality (replace `image_colors` with real images)
- Add menu item categories management
- Add bulk import/export for menu items
- Add date range blackout periods (e.g., holidays)
- Add specific date overrides for special events

## 🐛 Troubleshooting

### "Failed to fetch menu items"
- Check Supabase URL and service key in `.env`
- Verify the schema was applied correctly
- Check browser console for CORS errors

### "Unauthorized" errors
- Verify JWT_SECRET is set in `.env`
- Check admin credentials in `.env`
- Clear localStorage and login again

### Menu items not showing
- Verify `is_available = true` for items you want to display
- Check the `display_order` field for sorting
- Look at browser network tab for API errors

### Database connection errors
- Verify Supabase project is not paused
- Check service role key has correct permissions
- Ensure RLS policies are applied correctly

