# Gio's Corner Backend

Express + TypeScript API for managing catering orders.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

- **Supabase**: Get URL and service key from your Supabase project settings
- **Stripe**: Get secret key from Stripe dashboard (use test key for development)
- **Resend**: Sign up at resend.com and get API key
- **Admin Password**: Generate hash by running:
  ```bash
  node -e "console.log(require('bcrypt').hashSync('your-password', 10))"
  ```

### 3. Set Up Database

Run the SQL in `supabase-schema.sql` in your Supabase SQL editor to create the necessary tables.

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/menu` - Get menu items
- `POST /api/orders` - Submit new order

### Admin Endpoints (require authentication)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - List orders (filter by status)
- `GET /api/admin/orders/:id` - Get order details
- `POST /api/admin/orders/:id/accept` - Accept order and create Stripe invoice
- `POST /api/admin/orders/:id/deny` - Deny order with reason

## Project Structure

```
src/
├── index.ts              # Express app entry point
├── config/               # Configuration files
│   ├── database.ts       # Supabase client
│   ├── stripe.ts         # Stripe client
│   └── email.ts          # Email service
├── middleware/           # Express middleware
│   └── auth.ts           # Admin authentication
├── routes/               # API routes
│   ├── orders.ts         # Customer order routes
│   ├── admin.ts          # Admin routes
│   └── menu.ts           # Menu routes
├── services/             # Business logic
│   ├── orderService.ts   # Order operations
│   ├── emailService.ts   # Email sending
│   └── stripeService.ts  # Stripe operations
├── types/                # TypeScript types
│   └── index.ts
└── utils/                # Utility functions
    └── validation.ts
```

## Deployment to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard (all from .env)
4. Railway will automatically detect and deploy the Express app
5. Note your Railway URL and update FRONTEND_URL accordingly

## Development Tools

### Add Mock Orders

To populate the database with test orders for viewing in the admin portal:

```bash
node add-mock-orders.js
```

This will create 10 mock orders with various statuses (pending, accepted, denied) and different dates.

### Clear All Orders

To delete all orders from the database (useful for testing):

```bash
node clear-mock-orders.js
```

⚠️ **WARNING**: This will delete ALL orders from the database. Use with caution!

### Generate Password Hash

To generate a password hash for admin login:

```bash
node generate-password-hash.js your-password-here
```

### Test Admin Login

To test admin authentication:

```bash
node test-login.js
```

## Menu Configuration

To modify menu items, edit `src/config/menu.ts`. The menu is currently hardcoded for easy management.

## Email Templates

Email templates are in `src/services/emailService.ts`. Customize the content as needed.

## Security Notes

- All admin endpoints require JWT authentication
- Use strong passwords and keep JWT_SECRET secure
- Never commit .env file to version control
- Use Stripe test keys in development
- In production, ensure FRONTEND_URL is set to your Vercel domain


