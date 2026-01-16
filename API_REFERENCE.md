# Gio's Corner API Reference

Base URL: `http://localhost:3001` (development)

## Public Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "Gio's Corner API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Menu Items
```
GET /api/menu
```
Get all available menu items (public access).

**Response:**
```json
{
  "menuItems": [
    {
      "id": "family-dinner-meal",
      "name": "Family Dinner Meal",
      "description": "Complete family-style dinner...",
      "bio": "Detailed description...",
      "detailed_info": "Full information...",
      "price_cents": 5000,
      "category": "meals",
      "serves": 4,
      "image_colors": ["#FF6B6B"],
      "display_order": 0,
      "is_available": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Order
```
POST /api/orders
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "address": "123 Main St, Boston, MA 02101",
  "food_selection": [
    {
      "menu_item_id": "family-dinner-meal",
      "quantity": 2,
      "notes": "Extra cheese please"
    }
  ],
  "date_needed": "2024-12-25",
  "notes": "Please deliver between 5-6 PM"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "uuid-here",
    "customer_name": "John Doe",
    "status": "pending",
    ...
  }
}
```

## Admin Endpoints

All admin endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Admin Login
```
POST /api/admin/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "email": "admin@example.com"
}
```

### Orders Management

#### Get All Orders
```
GET /api/admin/orders
GET /api/admin/orders?status=pending
GET /api/admin/orders?status=accepted
GET /api/admin/orders?status=denied
```

**Response:**
```json
{
  "orders": [...]
}
```

#### Get Single Order
```
GET /api/admin/orders/:id
```

**Response:**
```json
{
  "order": {...}
}
```

#### Accept Order
```
POST /api/admin/orders/:id/accept
Content-Type: application/json
```

**Request Body:**
```json
{
  "total_price_cents": 10000
}
```

**Response:**
```json
{
  "message": "Order accepted successfully",
  "order": {
    "id": "uuid",
    "status": "accepted",
    "total_price_cents": 10000,
    "stripe_invoice_url": "https://invoice.stripe.com/...",
    ...
  }
}
```

#### Deny Order
```
POST /api/admin/orders/:id/deny
Content-Type: application/json
```

**Request Body:**
```json
{
  "admin_reason": "Sorry, we are fully booked on that date."
}
```

**Response:**
```json
{
  "message": "Order denied successfully",
  "order": {
    "id": "uuid",
    "status": "denied",
    "admin_reason": "Sorry, we are fully booked...",
    ...
  }
}
```

### Menu Management

#### Get All Menu Items (Admin)
```
GET /api/admin/menu
```
Returns all menu items including unavailable ones.

**Response:**
```json
{
  "menuItems": [...]
}
```

#### Get Single Menu Item
```
GET /api/admin/menu/:id
```

**Response:**
```json
{
  "menuItem": {...}
}
```

#### Create Menu Item
```
POST /api/admin/menu
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "new-item-id",
  "name": "New Menu Item",
  "description": "Short description",
  "bio": "Longer description (optional)",
  "detailed_info": "Full details (optional)",
  "price_cents": 5000,
  "category": "meals",
  "serves": 4,
  "image_colors": ["#FF6B6B", "#4ECDC4"],
  "display_order": 0,
  "is_available": true
}
```

**Required fields:**
- `id` (string, unique, kebab-case recommended)
- `name` (string)
- `description` (string)
- `price_cents` (number, >= 0)
- `category` (string)

**Response:**
```json
{
  "message": "Menu item created successfully",
  "menuItem": {...}
}
```

#### Update Menu Item
```
PUT /api/admin/menu/:id
Content-Type: application/json
```

**Request Body:** (partial update, only include fields to change)
```json
{
  "name": "Updated Name",
  "price_cents": 6000,
  "is_available": false
}
```

**Response:**
```json
{
  "message": "Menu item updated successfully",
  "menuItem": {...}
}
```

#### Delete Menu Item
```
DELETE /api/admin/menu/:id
```

**Response:**
```json
{
  "message": "Menu item deleted successfully"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here",
  "message": "Detailed error message (in development mode)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Data Types

### MenuItem
```typescript
{
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  description: string;
  bio?: string;
  detailed_info?: string;
  price_cents: number;
  category: string;
  serves?: number;
  image_colors?: string[];
  display_order?: number;
  is_available?: boolean;
}
```

### Order
```typescript
{
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  address: string;
  food_selection: FoodSelectionItem[];
  date_needed: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'denied';
  admin_reason?: string;
  stripe_invoice_id?: string;
  stripe_invoice_url?: string;
  total_price_cents?: number;
}
```

### FoodSelectionItem
```typescript
{
  menu_item_id: string;
  quantity: number;
  notes?: string;
}
```

## Testing with cURL

### Get Menu Items
```bash
curl http://localhost:3001/api/menu
```

### Admin Login
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

### Get Orders (with auth)
```bash
curl http://localhost:3001/api/admin/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Menu Item
```bash
curl -X POST http://localhost:3001/api/admin/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "id": "test-item",
    "name": "Test Item",
    "description": "A test menu item",
    "price_cents": 1000,
    "category": "meals"
  }'
```

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting middleware for production deployment.

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (development frontend)
- Configure `FRONTEND_URL` in `.env` for production

## Authentication

Admin endpoints use JWT (JSON Web Tokens) for authentication:
1. Login with `/api/admin/login` to receive a token
2. Include token in `Authorization: Bearer <token>` header
3. Tokens expire after 24 hours (configurable in `backend/src/middleware/auth.ts`)




