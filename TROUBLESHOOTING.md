# Troubleshooting Guide

Common issues and their solutions for Gio's Corner.

## Table of Contents
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Email Issues](#email-issues)
- [Payment Issues](#payment-issues)
- [Deployment Issues](#deployment-issues)
- [Authentication Issues](#authentication-issues)

---

## Backend Issues

### Backend won't start locally

**Symptom**: `npm run dev` fails or crashes

**Solutions**:
1. Check Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check `.env` file exists:
   ```bash
   ls -la .env
   ```

4. Verify all required environment variables are set:
   ```bash
   cat .env
   ```

5. Check for syntax errors in TypeScript files:
   ```bash
   npm run typecheck
   ```

### "Missing Supabase configuration" error

**Symptom**: Backend crashes with Supabase error

**Solutions**:
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in `.env`
2. Check for typos in environment variable names
3. Ensure no extra spaces in `.env` values
4. Verify Supabase project is active

### "Failed to create order" error

**Symptom**: POST /api/orders returns 500 error

**Solutions**:
1. Check backend logs for specific error
2. Verify `orders` table exists in Supabase
3. Check Supabase service key has correct permissions
4. Verify food_selection format is correct (array of objects)
5. Check date_needed is in correct format (YYYY-MM-DD)

### CORS errors

**Symptom**: Frontend can't connect to backend

**Solutions**:
1. Verify `FRONTEND_URL` is set correctly in backend `.env`
2. Check CORS configuration in `backend/src/index.ts`
3. Ensure frontend is running on expected port (5173)
4. Try clearing browser cache
5. Check browser console for specific CORS error

---

## Frontend Issues

### Frontend won't start

**Symptom**: `npm run dev` fails

**Solutions**:
1. Check Node.js version (18+)
2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Check for port conflicts (default: 5173)
4. Verify `VITE_API_URL` in `.env`

### "Failed to load menu" error

**Symptom**: Menu page shows error message

**Solutions**:
1. Verify backend is running (check http://localhost:3001/api/health)
2. Check `VITE_API_URL` in frontend `.env`
3. Open browser console for specific error
4. Verify CORS is configured correctly
5. Check network tab for failed requests

### Order form validation not working

**Symptom**: Can submit orders with invalid data

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify date validation logic in `Menu.tsx`
3. Clear browser cache
4. Try in incognito mode
5. Check if backend validation is catching errors

### Admin login redirects to login page

**Symptom**: Can't access admin dashboard

**Solutions**:
1. Check if JWT token is stored in localStorage:
   ```javascript
   // In browser console
   localStorage.getItem('admin_token')
   ```
2. Verify token hasn't expired (7 days)
3. Check network tab for 401 errors
4. Try logging out and back in
5. Clear localStorage and try again

---

## Database Issues

### Can't connect to Supabase

**Symptom**: All database operations fail

**Solutions**:
1. Verify Supabase project is active
2. Check `SUPABASE_URL` is correct
3. Verify `SUPABASE_SERVICE_KEY` is the service role key (not anon key)
4. Check Supabase dashboard for service status
5. Verify IP isn't blocked (check Supabase logs)

### Orders table doesn't exist

**Symptom**: "relation 'orders' does not exist" error

**Solutions**:
1. Run the schema in Supabase SQL Editor:
   - Copy contents of `backend/supabase-schema.sql`
   - Paste in SQL Editor
   - Execute
2. Verify table was created in Table Editor
3. Check for SQL syntax errors in schema

### Can't insert orders

**Symptom**: INSERT operations fail

**Solutions**:
1. Check RLS (Row Level Security) policies
2. Verify service role key is being used
3. Check column types match data being inserted
4. Verify food_selection is valid JSONB
5. Check Supabase logs for specific error

### Database connection limit reached

**Symptom**: "too many connections" error

**Solutions**:
1. Upgrade Supabase plan (free tier has limits)
2. Check for connection leaks in code
3. Restart Railway backend
4. Review connection pooling settings

---

## Email Issues

### Emails not sending

**Symptom**: No emails received

**Solutions**:
1. Check Resend dashboard logs
2. Verify `RESEND_API_KEY` is correct
3. Check spam/junk folders
4. Verify recipient email addresses are valid
5. Check backend logs for email errors
6. Verify Resend account is active

### "Invalid API key" error

**Symptom**: Email sending fails with auth error

**Solutions**:
1. Verify `RESEND_API_KEY` in `.env`
2. Check key hasn't been revoked in Resend dashboard
3. Ensure no extra spaces in API key
4. Try generating new API key

### Emails going to spam

**Symptom**: Emails delivered but in spam folder

**Solutions**:
1. Add custom domain in Resend
2. Verify domain with DNS records
3. Use verified domain in "from" addresses
4. Avoid spam trigger words in subject/body
5. Check SPF/DKIM records

### Wrong "from" email address

**Symptom**: Emails show wrong sender

**Solutions**:
1. Update email addresses in `backend/src/services/emailService.ts`
2. Use format: `Name <email@domain.com>`
3. Verify domain is verified in Resend
4. Restart backend after changes

### Email template broken

**Symptom**: Emails look wrong or have broken HTML

**Solutions**:
1. Check HTML syntax in `emailService.ts`
2. Test email template in Resend dashboard
3. Verify all variables are being replaced
4. Check for missing closing tags
5. Test in multiple email clients

---

## Payment Issues

### Stripe invoice not creating

**Symptom**: Order accepted but no invoice

**Solutions**:
1. Check Stripe dashboard for errors
2. Verify `STRIPE_SECRET_KEY` is correct
3. Check backend logs for Stripe errors
4. Ensure Stripe is in correct mode (test/live)
5. Verify customer email is valid

### "Invalid API key" error

**Symptom**: Stripe operations fail

**Solutions**:
1. Verify `STRIPE_SECRET_KEY` in `.env`
2. Check key starts with `sk_test_` (test) or `sk_live_` (live)
3. Ensure key hasn't been revoked
4. Check Stripe dashboard API keys section

### Invoice created but no URL

**Symptom**: Invoice exists but customer can't pay

**Solutions**:
1. Check if invoice was finalized
2. Verify `hosted_invoice_url` in Stripe response
3. Check Stripe dashboard for invoice status
4. Ensure invoice isn't in draft mode

### Test payments not working

**Symptom**: Can't complete test payments

**Solutions**:
1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Use any future expiry date
3. Use any 3-digit CVC
4. Ensure using test mode API key
5. Check Stripe dashboard test mode toggle

---

## Deployment Issues

### Railway deployment fails

**Symptom**: Railway build or deploy fails

**Solutions**:
1. Check Railway logs for specific error
2. Verify `backend` is set as root directory
3. Check `package.json` has correct scripts:
   ```json
   "start": "node dist/index.js",
   "build": "tsc"
   ```
4. Verify all environment variables are set
5. Check Node.js version compatibility
6. Try manual redeploy

### Vercel deployment fails

**Symptom**: Vercel build fails

**Solutions**:
1. Check Vercel logs for specific error
2. Verify `frontend` is set as root directory
3. Check build command is `npm run build`
4. Verify output directory is `dist`
5. Check for TypeScript errors
6. Ensure `VITE_API_URL` is set

### Backend deployed but not responding

**Symptom**: Railway shows deployed but API doesn't work

**Solutions**:
1. Check Railway logs for runtime errors
2. Verify environment variables are set
3. Test health endpoint directly
4. Check if service is running in Railway dashboard
5. Verify PORT is set correctly (Railway provides this)

### Frontend deployed but can't connect to backend

**Symptom**: Frontend loads but API calls fail

**Solutions**:
1. Verify `VITE_API_URL` points to Railway URL
2. Check CORS settings in backend
3. Update `FRONTEND_URL` in Railway to Vercel URL
4. Verify both services are deployed
5. Check browser console for errors

### Environment variables not working

**Symptom**: App works locally but not in production

**Solutions**:
1. Verify all env vars are set in Railway/Vercel
2. Check for typos in variable names
3. Ensure no extra spaces in values
4. Redeploy after setting variables
5. Check if variables are prefixed correctly (VITE_ for frontend)

---

## Authentication Issues

### Can't login to admin

**Symptom**: Login fails with "Invalid credentials"

**Solutions**:
1. Verify `ADMIN_EMAIL` matches login email
2. Check `ADMIN_PASSWORD_HASH` is set correctly
3. Generate new password hash:
   ```bash
   node -e "console.log(require('bcrypt').hashSync('password', 10))"
   ```
4. Ensure `JWT_SECRET` is set
5. Check backend logs for auth errors

### "Unauthorized" error on admin routes

**Symptom**: Can't access admin endpoints

**Solutions**:
1. Check if JWT token is being sent:
   - Open browser DevTools
   - Network tab
   - Check Authorization header
2. Verify token hasn't expired (7 days)
3. Check token format: `Bearer <token>`
4. Try logging out and back in
5. Clear localStorage and login again

### Admin session expires too quickly

**Symptom**: Have to login frequently

**Solutions**:
1. Check JWT expiry in `backend/src/middleware/auth.ts`
2. Increase expiry time if needed:
   ```typescript
   { expiresIn: '7d' }  // Change to '30d' for 30 days
   ```
3. Ensure localStorage isn't being cleared
4. Check browser settings for localStorage

### Password hash not working

**Symptom**: Can't generate or verify password hash

**Solutions**:
1. Ensure bcrypt is installed:
   ```bash
   npm install bcrypt
   ```
2. Use correct bcrypt command:
   ```bash
   node -e "console.log(require('bcrypt').hashSync('yourpassword', 10))"
   ```
3. Copy entire hash including `$2b$10$` prefix
4. Ensure no line breaks in hash

---

## General Debugging Tips

### Enable Detailed Logging

**Backend**:
Add more console.log statements in `backend/src/` files

**Frontend**:
Check browser console (F12 → Console tab)

### Check Service Dashboards

1. **Railway**: Logs and metrics
2. **Vercel**: Build and runtime logs
3. **Supabase**: Database logs and queries
4. **Stripe**: API logs and events
5. **Resend**: Email delivery logs

### Test Individual Components

1. Test backend health: `curl http://localhost:3001/api/health`
2. Test database: Check Supabase Table Editor
3. Test Stripe: Use Stripe CLI or dashboard
4. Test emails: Check Resend logs

### Common Commands

```bash
# Check if port is in use
lsof -i :3001
lsof -i :5173

# Kill process on port
kill -9 $(lsof -t -i:3001)

# Check environment variables
printenv | grep SUPABASE
printenv | grep STRIPE

# Test API endpoint
curl http://localhost:3001/api/health
curl http://localhost:3001/api/menu

# Check Node.js version
node --version
npm --version

# Clear npm cache
npm cache clean --force

# Rebuild everything
rm -rf node_modules package-lock.json
npm install
```

### Browser DevTools

1. **Console**: JavaScript errors
2. **Network**: API requests and responses
3. **Application**: localStorage, cookies
4. **Sources**: Debugging with breakpoints

### When All Else Fails

1. Restart everything:
   - Stop backend and frontend
   - Clear node_modules
   - Reinstall dependencies
   - Restart services

2. Check documentation:
   - Review QUICKSTART.md
   - Check service-specific docs
   - Review inline code comments

3. Check for updates:
   - Update dependencies
   - Check for breaking changes
   - Review changelog

4. Create minimal reproduction:
   - Test with fresh database
   - Test with test API keys
   - Test in incognito mode

---

## Getting Help

If you're still stuck:

1. Check service status pages:
   - Supabase: status.supabase.com
   - Stripe: status.stripe.com
   - Vercel: vercel-status.com
   - Railway: status.railway.app

2. Review logs systematically:
   - Backend logs (Railway/local)
   - Frontend console (browser)
   - Database logs (Supabase)
   - Email logs (Resend)
   - Payment logs (Stripe)

3. Search documentation:
   - Project docs in this repo
   - Service-specific documentation
   - Stack Overflow
   - GitHub issues

4. Check common issues:
   - Environment variables
   - API keys
   - Network connectivity
   - Service quotas/limits

---

## Prevention Tips

1. **Use version control**: Commit working code frequently
2. **Test locally first**: Don't deploy untested changes
3. **Monitor services**: Check dashboards regularly
4. **Keep backups**: Supabase auto-backs up, but export important data
5. **Document changes**: Note what you changed and why
6. **Use staging**: Test in staging before production (optional)
7. **Set up alerts**: Configure error notifications (optional)

---

**Remember**: Most issues are configuration-related. Double-check environment variables and API keys first!





