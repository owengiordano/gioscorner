# Environment Variables Setup

This document outlines all the environment variables needed for Gio's Corner to function properly.

## Backend Environment Variables

Create a `.env` file in the `/backend` directory with the following variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key

# Email Configuration
OWNER_EMAIL=your_email@example.com
FROM_EMAIL=your_verified_email@example.com

# Admin Authentication
ADMIN_EMAIL=admin@gioscorner.com
ADMIN_PASSWORD_HASH=your_bcrypt_password_hash
JWT_SECRET=your_random_jwt_secret_string
```

### How to Get Each Key

#### 1. Supabase Keys

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select your existing project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

#### 2. Stripe Keys

1. Go to [stripe.com](https://stripe.com) and sign in
2. Go to **Developers** → **API keys**
3. Copy the following:
   - **Secret key** → `STRIPE_SECRET_KEY` (starts with `sk_test_` for test mode)
   - **Publishable key** → `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_` for test mode)

**Note:** Use test keys during development. Switch to live keys (`sk_live_` and `pk_live_`) only when ready for production.

#### 3. Resend API Key

1. Go to [resend.com](https://resend.com) and sign up/sign in
2. Go to **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "Gio's Corner Production")
5. Copy the key → `RESEND_API_KEY` (starts with `re_`)

**Important:** You'll also need to verify your domain in Resend to send emails from `orders@gioscorner.com`. During development, you can use the test domain provided by Resend.

#### 4. Email Configuration

Set the email addresses for your application:

```bash
# Where you want to receive order notifications
OWNER_EMAIL=your_email@example.com

# The "from" address for outgoing emails (must be verified in Resend)
FROM_EMAIL=your_verified_email@example.com
```

**Important Notes:**
- `FROM_EMAIL` must be verified in your Resend account
- For development, you can use Resend's test domain or a verified email
- If not set, defaults to `taragiord@gmail.com`
- For production, use your custom domain email (e.g., `orders@gioscorner.com`)

#### 5. Admin Authentication

Generate a password hash for admin login:

```bash
# Run this in the backend directory
npm run generate-password-hash
```

This will prompt you for a password and output a bcrypt hash. Copy the hash to `ADMIN_PASSWORD_HASH`.

Set your admin email:
```bash
ADMIN_EMAIL=admin@gioscorner.com
```

Generate a random JWT secret (any long random string):
```bash
JWT_SECRET=$(openssl rand -base64 32)
```

Or use any random string generator.

## Frontend Environment Variables

Create a `.env` file in the `/frontend` directory with the following variables:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001
```

### Production Setup

For production, update the frontend `.env` to point to your deployed backend:

```bash
VITE_API_URL=https://your-backend-domain.com
```

## Complete Example Files

### Backend `.env` Example

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...

# Resend Email Configuration
RESEND_API_KEY=re_AbCdEfGh_1234567890abcdefghijklmnop

# Email Configuration
OWNER_EMAIL=gio@gioscorner.com
FROM_EMAIL=taragiord@gmail.com

# Admin Authentication
ADMIN_EMAIL=admin@gioscorner.com
ADMIN_PASSWORD_HASH=$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend `.env` Example

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001
```

## Security Best Practices

1. **Never commit `.env` files to git** - They're already in `.gitignore`
2. **Use different keys for development and production**
3. **Rotate your JWT_SECRET regularly in production**
4. **Keep your Supabase service role key secret** - It has full database access
5. **Use Stripe test keys during development** - Only switch to live keys when ready
6. **Store production environment variables securely** - Use your hosting platform's environment variable management (e.g., Vercel, Railway, Heroku)

## Testing Your Setup

After setting up your environment variables:

1. **Test Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   You should see: "✅ Server running on port 3001"

2. **Test Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   You should see: "Local: http://localhost:5173"

3. **Test Email (Optional):**
   Create a test order and check if emails are sent to `OWNER_EMAIL`

4. **Test Stripe (Optional):**
   Use Stripe's test card numbers to test invoice creation:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

## Troubleshooting

### "Failed to connect to Supabase"
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Verify your Supabase project is active

### "Stripe API error"
- Verify your `STRIPE_SECRET_KEY` is correct
- Make sure you're using the right key for your environment (test vs live)

### "Email sending failed"
- Check that `RESEND_API_KEY` is valid
- Verify your domain is set up in Resend (or use their test domain)
- Check that `OWNER_EMAIL` is a valid email address

### "Admin login failed"
- Verify `ADMIN_PASSWORD_HASH` was generated correctly using `npm run generate-password-hash`
- Check that `JWT_SECRET` is set
- Make sure `ADMIN_EMAIL` matches what you're using to log in

## Need Help?

If you're still having issues:
1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Make sure you've run the database migrations in Supabase
4. Restart both backend and frontend servers after changing `.env` files

