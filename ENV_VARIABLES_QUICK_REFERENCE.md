# Environment Variables Quick Reference

## Backend `.env` File

Copy this template and fill in your values:

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ============================================
# SUPABASE (Database)
# ============================================
# Get from: https://supabase.com → Your Project → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# STRIPE (Payments)
# ============================================
# Get from: https://stripe.com → Developers → API keys
# Use test keys (sk_test_...) for development
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...

# ============================================
# RESEND (Email Service)
# ============================================
# Get from: https://resend.com → API Keys
RESEND_API_KEY=re_...

# ============================================
# EMAIL CONFIGURATION
# ============================================
# Your email address to receive order notifications
OWNER_EMAIL=your_email@example.com

# ============================================
# ADMIN AUTHENTICATION
# ============================================
# Email for admin login
ADMIN_EMAIL=admin@gioscorner.com

# Generate hash with: npm run generate-password-hash
ADMIN_PASSWORD_HASH=$2b$10$...

# Generate with: openssl rand -base64 32
JWT_SECRET=your-random-secret-key-here
```

## Frontend `.env` File

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001
```

## Where to Get Each Key

| Variable | Where to Get It |
|----------|----------------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys → Publishable key |
| `RESEND_API_KEY` | Resend Dashboard → API Keys → Create API Key |
| `OWNER_EMAIL` | Your email address |
| `ADMIN_EMAIL` | Your admin login email |
| `ADMIN_PASSWORD_HASH` | Run `npm run generate-password-hash` in backend folder |
| `JWT_SECRET` | Run `openssl rand -base64 32` or use any random string |

## Quick Setup Commands

```bash
# 1. Clone/navigate to project
cd gios-corner

# 2. Setup backend
cd backend
cp .env.example .env  # If you have an example file
# Edit .env with your values
npm install
npm run generate-password-hash  # Generate admin password hash
npm run dev  # Start backend

# 3. Setup frontend (in new terminal)
cd frontend
echo "VITE_API_URL=http://localhost:3001" > .env
npm install
npm run dev  # Start frontend
```

## Testing Your Setup

### Test Backend
```bash
cd backend
npm run dev
```
✅ Should see: "Server running on port 3001"

### Test Frontend
```bash
cd frontend
npm run dev
```
✅ Should see: "Local: http://localhost:5173"

### Test Stripe
Use test card: `4242 4242 4242 4242`, any future expiry, any CVC

### Test Email
Create a test order and check if emails arrive at `OWNER_EMAIL`

## Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to connect to Supabase" | Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| "Stripe API error" | Verify `STRIPE_SECRET_KEY` is correct and starts with `sk_test_` |
| "Email sending failed" | Check `RESEND_API_KEY` is valid |
| "Admin login failed" | Regenerate `ADMIN_PASSWORD_HASH` with correct password |
| "CORS error" | Verify `FRONTEND_URL` matches your frontend URL |

## Security Reminders

⚠️ **NEVER commit `.env` files to git**
⚠️ **Use test keys for development**
⚠️ **Keep service role key secret**
⚠️ **Change JWT_SECRET in production**

## Production Setup

For production, update these values:

```bash
# Backend .env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...  # Use live keys
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Frontend .env
VITE_API_URL=https://your-api-domain.com
```

## Need More Help?

📖 See `ENV_SETUP.md` for detailed setup instructions
📖 See `ORDER_WORKFLOW_GUIDE.md` for workflow documentation
📖 See `ORDER_WORKFLOW_IMPLEMENTATION.md` for technical details

