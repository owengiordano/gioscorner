# Quick Start Guide

Get Gio's Corner running locally in minutes.

## Just Want to Work on UI? 🎨

**No backend setup needed!** Run the frontend immediately:

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3001" > .env
npm run dev
```

Open http://localhost:5173 and start editing pages in `src/pages/` - changes will hot reload!

**See [UI_DEVELOPMENT.md](UI_DEVELOPMENT.md) for UI-only development guide.**

---

## Full Setup (Backend + Frontend)

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Stripe account (test mode)
- A Resend account (free tier works)

### Setup Steps

### 1. Clone and Install

```bash
# Navigate to the project
cd gios-corner

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:
   ```bash
   # Copy contents of backend/supabase-schema.sql and paste in SQL Editor
   ```
3. Get your credentials from Project Settings > API:
   - Project URL
   - service_role key

### 3. Set Up Stripe

1. Sign up at [stripe.com](https://stripe.com)
2. Get your test API key from Developers > API keys
3. Copy the "Secret key" (starts with `sk_test_`)

### 4. Set Up Resend

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Copy the key (starts with `re_`)

### 5. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

STRIPE_SECRET_KEY=sk_test_your-test-key
STRIPE_WEBHOOK_SECRET=whsec_optional

RESEND_API_KEY=re_your-key-here
OWNER_EMAIL=your-email@example.com

ADMIN_EMAIL=admin@gioscorner.com
ADMIN_PASSWORD_HASH=see-below
JWT_SECRET=any-random-string-for-development
```

Generate password hash:
```bash
node -e "console.log(require('bcrypt').hashSync('admin123', 10))"
```
Copy the output and paste as `ADMIN_PASSWORD_HASH`.

### 6. Configure Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 7. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 8. Test the Application

1. **Frontend**: Open http://localhost:5173
2. **Backend Health**: Visit http://localhost:3001/api/health

### 9. Test Customer Flow

1. Go to http://localhost:5173/menu
2. Select menu items
3. Fill out the order form
4. Use a date at least 24 hours in the future
5. Submit the order
6. Check your email for confirmation

### 10. Test Admin Flow

1. Go to http://localhost:5173/admin
2. Login with:
   - Email: `admin@gioscorner.com`
   - Password: `admin123` (or whatever you set)
3. View pending orders
4. Accept or deny orders
5. Check emails are sent

## Common Issues

### "Failed to load menu"
- Check backend is running on port 3001
- Verify `VITE_API_URL` in frontend/.env
- Check browser console for CORS errors

### "Failed to create order"
- Check Supabase credentials in backend/.env
- Verify orders table exists in Supabase
- Check backend terminal for errors

### "Emails not sending"
- Verify Resend API key is correct
- Check backend terminal for email errors
- Note: Resend free tier has sending limits

### "Admin login failed"
- Verify ADMIN_PASSWORD_HASH is set correctly
- Check ADMIN_EMAIL matches login email
- Ensure JWT_SECRET is set

### "Stripe invoice creation failed"
- Verify Stripe API key is correct
- Ensure you're using test mode key (sk_test_)
- Check backend terminal for Stripe errors

## Next Steps

- Customize menu items in `backend/src/config/menu.ts`
- Update branding and content in frontend pages
- Customize email templates in `backend/src/services/emailService.ts`
- Read `DEPLOYMENT.md` for production deployment

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Backend: Changes to `.ts` files auto-restart server
- Frontend: Changes to `.tsx` files auto-refresh browser

### Viewing Database
- Go to Supabase Dashboard > Table Editor
- View orders table to see submitted orders

### Testing Stripe
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Any future expiry date and any CVC

### Viewing Emails
- Check Resend Dashboard > Logs
- Emails sent to any address in development

## Project Structure

```
gios-corner/
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration (DB, Stripe, Email, Menu)
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## Customization Quick Reference

| What to Change | Where to Edit |
|----------------|---------------|
| Menu items & prices | `backend/src/config/menu.ts` |
| Email templates | `backend/src/services/emailService.ts` |
| Landing page content | `frontend/src/pages/Home.tsx` |
| About page content | `frontend/src/pages/About.tsx` |
| Colors & styling | `frontend/tailwind.config.js` |
| Company info in footer | `frontend/src/components/Footer.tsx` |

## Support

- Backend API docs: Check `backend/README.md`
- Frontend docs: Check `frontend/README.md`
- Deployment guide: Check `DEPLOYMENT.md`
- Main README: Check `README.md`

Happy coding! 🍽️

