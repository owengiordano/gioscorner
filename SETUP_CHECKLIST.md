# Setup Checklist

Use this checklist to ensure you've completed all setup steps.

## Local Development Setup

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Accounts Created
- [ ] Supabase account created
- [ ] Stripe account created
- [ ] Resend account created
- [ ] GitHub account (for deployment)

### Backend Setup
- [ ] Navigated to `backend/` directory
- [ ] Ran `npm install`
- [ ] Created `.env` file from `.env.example`
- [ ] Set `SUPABASE_URL` in `.env`
- [ ] Set `SUPABASE_SERVICE_KEY` in `.env`
- [ ] Set `STRIPE_SECRET_KEY` in `.env`
- [ ] Set `RESEND_API_KEY` in `.env`
- [ ] Set `OWNER_EMAIL` in `.env`
- [ ] Generated and set `ADMIN_PASSWORD_HASH` in `.env`
- [ ] Set `JWT_SECRET` in `.env`
- [ ] Ran database schema in Supabase SQL Editor
- [ ] Verified `orders` table exists in Supabase
- [ ] Started backend with `npm run dev`
- [ ] Verified backend running at http://localhost:3001
- [ ] Tested health endpoint: http://localhost:3001/api/health

### Frontend Setup
- [ ] Navigated to `frontend/` directory
- [ ] Ran `npm install`
- [ ] Created `.env` file from `.env.example`
- [ ] Set `VITE_API_URL=http://localhost:3001` in `.env`
- [ ] Started frontend with `npm run dev`
- [ ] Verified frontend running at http://localhost:5173
- [ ] Verified menu loads without errors

### Testing Customer Flow
- [ ] Opened http://localhost:5173
- [ ] Navigated to Menu page
- [ ] Selected menu items
- [ ] Filled out order form
- [ ] Used date 24+ hours in future
- [ ] Submitted order successfully
- [ ] Received "Order submitted" confirmation
- [ ] Checked email for customer confirmation
- [ ] Checked email for owner notification

### Testing Admin Flow
- [ ] Navigated to http://localhost:5173/admin
- [ ] Logged in with admin credentials
- [ ] Viewed pending orders
- [ ] Saw the test order in list
- [ ] Clicked on order to view details
- [ ] Accepted the order
- [ ] Verified Stripe invoice created
- [ ] Checked email for acceptance notification
- [ ] Tested denying an order with reason
- [ ] Verified denial email sent

### Customization (Optional)
- [ ] Updated menu items in `backend/src/config/menu.ts`
- [ ] Customized email templates in `backend/src/services/emailService.ts`
- [ ] Updated landing page content in `frontend/src/pages/Home.tsx`
- [ ] Updated about page in `frontend/src/pages/About.tsx`
- [ ] Updated footer info in `frontend/src/components/Footer.tsx`
- [ ] Customized colors in `frontend/tailwind.config.js`

---

## Production Deployment Setup

### Pre-Deployment
- [ ] Code committed to Git
- [ ] Repository pushed to GitHub
- [ ] All local testing completed
- [ ] Menu items finalized
- [ ] Email templates reviewed
- [ ] Content reviewed and approved

### Supabase Production
- [ ] Production Supabase project created
- [ ] Database schema deployed
- [ ] Production URL and service key saved
- [ ] RLS policies verified

### Stripe Production
- [ ] Stripe account verified
- [ ] Switched to live mode
- [ ] Live API keys obtained
- [ ] Webhook endpoint configured (optional)
- [ ] Test transaction completed

### Resend Production
- [ ] Custom domain added (optional)
- [ ] Domain verified
- [ ] Production API key obtained
- [ ] Test email sent successfully

### Railway Deployment
- [ ] Railway account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] All environment variables set
- [ ] `FRONTEND_URL` set to Vercel URL
- [ ] Deployment successful
- [ ] Railway URL noted
- [ ] Health endpoint tested

### Vercel Deployment
- [ ] Vercel account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Root directory set to `frontend`
- [ ] Framework preset set to Vite
- [ ] `VITE_API_URL` set to Railway URL
- [ ] Deployment successful
- [ ] Vercel URL noted
- [ ] Site loads without errors

### Post-Deployment Testing
- [ ] Visited production frontend URL
- [ ] Menu loads correctly
- [ ] Submitted test order
- [ ] Received customer email
- [ ] Received owner email
- [ ] Logged into admin dashboard
- [ ] Accepted test order
- [ ] Stripe invoice created
- [ ] Payment link works
- [ ] Tested order denial
- [ ] All emails received correctly

### Production Configuration
- [ ] Updated `FRONTEND_URL` in Railway to production domain
- [ ] Updated `VITE_API_URL` in Vercel to production domain
- [ ] Verified CORS settings
- [ ] Tested from multiple devices
- [ ] Tested on mobile
- [ ] Verified responsive design

### Custom Domain (Optional)
- [ ] Custom domain purchased
- [ ] DNS configured for Vercel
- [ ] Frontend accessible via custom domain
- [ ] SSL certificate active
- [ ] Subdomain configured for API (optional)
- [ ] API accessible via subdomain
- [ ] Environment variables updated with custom domains

### Security Review
- [ ] `.env` files not committed to Git
- [ ] Strong admin password set
- [ ] JWT_SECRET is random and secure
- [ ] Stripe live keys secured
- [ ] Service role keys secured
- [ ] 2FA enabled on all accounts
- [ ] API keys rotated if exposed

### Monitoring Setup
- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Supabase dashboard bookmarked
- [ ] Stripe dashboard bookmarked
- [ ] Resend dashboard bookmarked
- [ ] Email alerts configured (optional)

### Documentation
- [ ] README.md reviewed
- [ ] DEPLOYMENT.md read
- [ ] QUICKSTART.md read
- [ ] PROJECT_SUMMARY.md reviewed
- [ ] Team members onboarded (if applicable)

---

## Maintenance Checklist

### Weekly
- [ ] Check Railway logs for errors
- [ ] Review Resend email delivery rates
- [ ] Check Stripe for pending invoices
- [ ] Review pending orders in admin dashboard

### Monthly
- [ ] Review Supabase database size
- [ ] Check Railway usage and costs
- [ ] Review Stripe transaction fees
- [ ] Update dependencies if needed
- [ ] Backup database (Supabase auto-backups)

### As Needed
- [ ] Update menu items
- [ ] Modify email templates
- [ ] Update website content
- [ ] Respond to customer inquiries
- [ ] Process orders via admin dashboard

---

## Troubleshooting Checklist

### Backend Issues
- [ ] Check Railway logs
- [ ] Verify all environment variables set
- [ ] Test database connection
- [ ] Verify Stripe API key
- [ ] Check Resend API key
- [ ] Test health endpoint

### Frontend Issues
- [ ] Check Vercel logs
- [ ] Verify `VITE_API_URL` is correct
- [ ] Check browser console for errors
- [ ] Test API connection
- [ ] Clear browser cache
- [ ] Try incognito mode

### Email Issues
- [ ] Check Resend dashboard logs
- [ ] Verify API key is correct
- [ ] Check spam folders
- [ ] Verify domain is verified
- [ ] Test with different email addresses
- [ ] Check sending limits

### Payment Issues
- [ ] Verify Stripe API key
- [ ] Check Stripe dashboard for errors
- [ ] Ensure correct mode (test/live)
- [ ] Test with Stripe test cards
- [ ] Review invoice creation logs
- [ ] Check customer email is valid

### Database Issues
- [ ] Check Supabase dashboard
- [ ] Verify service key is correct
- [ ] Check table exists
- [ ] Review RLS policies
- [ ] Check connection limits
- [ ] Review query logs

---

## Quick Reference

### Important URLs (Development)
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Backend Health: http://localhost:3001/api/health
- Admin Login: http://localhost:5173/admin

### Important URLs (Production)
- Frontend: https://your-app.vercel.app
- Backend: https://your-app.railway.app
- Admin: https://your-app.vercel.app/admin

### Important Commands
```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Generate password hash
node -e "console.log(require('bcrypt').hashSync('password', 10))"
```

### Support Resources
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Resend Docs: https://resend.com/docs
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

---

## Notes

Use this space for project-specific notes:

```
Admin Credentials:
Email: 
Password: 

Production URLs:
Frontend: 
Backend: 

Important Dates:
Launched: 
Last Updated: 

Team Contacts:
Owner: 
Developer: 
Support: 
```

---

**Status**: [ ] Development [ ] Testing [ ] Deployed [ ] Live

**Last Updated**: _________________

**Completed By**: _________________

