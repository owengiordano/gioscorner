# Deployment Guide

Complete guide for deploying Gio's Corner to production.

## Prerequisites

- GitHub account (for code hosting)
- Supabase account (database)
- Stripe account (payments)
- Resend account (email)
- Railway account (backend hosting)
- Vercel account (frontend hosting)

---

## Step 1: Set Up Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization, project name, database password, and region
   - Wait for project to be created

2. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `backend/supabase-schema.sql`
   - Paste and run the SQL
   - Verify `orders` table was created

3. **Get Credentials**
   - Go to Project Settings > API
   - Copy `Project URL` (SUPABASE_URL)
   - Copy `service_role` key (SUPABASE_SERVICE_KEY) - **Keep this secret!**

---

## Step 2: Set Up Stripe

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Complete account setup

2. **Get API Keys**
   - Go to Developers > API keys
   - Copy "Secret key" (starts with `sk_test_` for test mode)
   - For production, use live mode keys (starts with `sk_live_`)

3. **Optional: Set Up Webhooks** (for payment confirmations)
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-railway-url.railway.app/api/webhooks/stripe`
   - Select events: `invoice.paid`, `invoice.payment_failed`
   - Copy webhook signing secret

---

## Step 3: Set Up Resend (Email)

1. **Create Resend Account**
   - Sign up at [resend.com](https://resend.com)
   - Verify your email

2. **Add Domain** (Optional but recommended for production)
   - Go to Domains
   - Add your domain (e.g., gioscorner.com)
   - Add DNS records as instructed
   - Wait for verification

3. **Get API Key**
   - Go to API Keys
   - Create new API key
   - Copy the key (starts with `re_`)

4. **Update Email Addresses**
   - In `backend/src/services/emailService.ts`, update the `from` addresses
   - Use format: `Gio's Corner <orders@yourdomain.com>`
   - Or use Resend's default: `onboarding@resend.dev` (for testing)

---

## Step 4: Generate Admin Password Hash

You need to hash your admin password before deployment:

```bash
cd backend
npm install
node -e "console.log(require('bcrypt').hashSync('YOUR_SECURE_PASSWORD', 10))"
```

Copy the output hash - you'll need it for environment variables.

---

## Step 5: Deploy Backend to Railway

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Express app

3. **Configure Root Directory**
   - Go to project settings
   - Set "Root Directory" to `backend`
   - Set "Start Command" to `npm start`

4. **Set Environment Variables**
   - Go to Variables tab
   - Add all variables from `backend/.env.example`:

   ```
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   
   STRIPE_SECRET_KEY=sk_live_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   
   RESEND_API_KEY=re_your_key
   OWNER_EMAIL=owner@gioscorner.com
   
   ADMIN_EMAIL=admin@gioscorner.com
   ADMIN_PASSWORD_HASH=your_bcrypt_hash
   JWT_SECRET=your-super-secret-random-string
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Note your Railway URL (e.g., `https://your-app.railway.app`)
   - Test health endpoint: `https://your-app.railway.app/api/health`

---

## Step 6: Deploy Frontend to Vercel

1. **Update Frontend Environment**
   - You'll set `VITE_API_URL` to your Railway URL in Vercel

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Set Environment Variables**
   - Add environment variable:
     ```
     VITE_API_URL=https://your-railway-app.railway.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your Vercel URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend FRONTEND_URL**
   - Go back to Railway
   - Update `FRONTEND_URL` environment variable to your Vercel URL
   - Railway will automatically redeploy

---

## Step 7: Configure Custom Domain (Optional)

### For Frontend (Vercel)
1. Go to Project Settings > Domains
2. Add your domain (e.g., `gioscorner.com`)
3. Follow DNS configuration instructions
4. Update Railway's `FRONTEND_URL` to your custom domain

### For Backend (Railway)
1. Go to Settings > Domains
2. Add custom domain (e.g., `api.gioscorner.com`)
3. Add CNAME record to your DNS
4. Update Vercel's `VITE_API_URL` to your custom domain

---

## Step 8: Test Everything

### Test Customer Flow
1. Visit your Vercel URL
2. Browse menu
3. Submit a test order (use date 24+ hours ahead)
4. Check email for confirmation

### Test Admin Flow
1. Go to `/admin`
2. Login with your admin credentials
3. View the pending order
4. Accept the order
5. Check Stripe dashboard for invoice
6. Check email for acceptance notification

### Test Email Delivery
- Check spam folders if emails don't arrive
- Verify Resend domain is verified
- Check Resend logs for delivery status

---

## Step 9: Production Checklist

Before going live:

- [ ] Use Stripe live mode keys (not test keys)
- [ ] Verify all email addresses are correct
- [ ] Test with real email addresses
- [ ] Set strong admin password
- [ ] Keep JWT_SECRET secure and random
- [ ] Never commit `.env` files
- [ ] Test order flow end-to-end
- [ ] Test payment flow with real card
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Configure custom domains
- [ ] Update contact information in footer
- [ ] Add privacy policy and terms (if required)

---

## Monitoring & Maintenance

### Railway (Backend)
- Check logs: Railway Dashboard > Deployments > Logs
- Monitor usage: Railway Dashboard > Metrics
- Set up alerts for errors

### Vercel (Frontend)
- Check deployments: Vercel Dashboard > Deployments
- Monitor analytics: Vercel Dashboard > Analytics
- Review build logs for errors

### Supabase (Database)
- Monitor database size: Supabase Dashboard > Database
- Check table usage: Supabase Dashboard > Table Editor
- Review logs: Supabase Dashboard > Logs

### Stripe (Payments)
- Monitor invoices: Stripe Dashboard > Invoices
- Check payment status: Stripe Dashboard > Payments
- Review customer data: Stripe Dashboard > Customers

### Resend (Email)
- Check delivery: Resend Dashboard > Logs
- Monitor sending limits: Resend Dashboard > Usage
- Review bounce/complaint rates

---

## Troubleshooting

### Backend won't start on Railway
- Check environment variables are set correctly
- Review Railway logs for errors
- Ensure `backend/package.json` has correct start script
- Verify Node.js version compatibility

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly in Vercel
- Verify Railway backend is running
- Check CORS settings in backend
- Test backend health endpoint directly

### Emails not sending
- Verify Resend API key is correct
- Check Resend domain verification
- Review Resend logs for errors
- Check spam folders
- Ensure `from` email addresses are valid

### Stripe invoices not creating
- Verify Stripe API key is correct
- Check Stripe is in correct mode (test/live)
- Review Railway logs for Stripe errors
- Ensure customer email is valid

### Admin can't login
- Verify `ADMIN_PASSWORD_HASH` is set correctly
- Check `ADMIN_EMAIL` matches login email
- Ensure `JWT_SECRET` is set
- Review browser console for errors

---

## Updating the Application

### Update Menu Items
1. Edit `backend/src/config/menu.ts`
2. Commit and push changes
3. Railway will auto-deploy

### Update Email Templates
1. Edit `backend/src/services/emailService.ts`
2. Commit and push changes
3. Railway will auto-deploy

### Update Frontend Content
1. Edit relevant page in `frontend/src/pages/`
2. Commit and push changes
3. Vercel will auto-deploy

---

## Costs Estimate

- **Supabase**: Free tier (up to 500MB database, 2GB bandwidth)
- **Railway**: ~$5-20/month (depends on usage)
- **Vercel**: Free tier (100GB bandwidth)
- **Stripe**: 2.9% + $0.30 per transaction
- **Resend**: Free tier (100 emails/day, 3,000/month)

Total estimated monthly cost: **$5-20** (excluding transaction fees)

---

## Support

For issues or questions:
- Backend logs: Railway Dashboard
- Frontend logs: Vercel Dashboard
- Database: Supabase Dashboard
- Email: Resend Dashboard
- Payments: Stripe Dashboard

## Security Notes

- Never commit `.env` files
- Keep service keys secret
- Use strong admin passwords
- Regularly update dependencies
- Monitor for suspicious activity
- Enable 2FA on all accounts





