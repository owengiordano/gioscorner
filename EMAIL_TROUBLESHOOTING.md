# Email Troubleshooting Guide

This guide helps you diagnose and fix email delivery issues with Resend.

## Quick Diagnosis

### Step 1: Test Resend Configuration

Run the test script to verify your Resend setup:

```bash
cd backend
node test-resend.js
```

This will:
- ✅ Check if `RESEND_API_KEY` is set
- ✅ Check if `OWNER_EMAIL` is set
- ✅ Attempt to send a test email
- ✅ Show detailed error messages if it fails

### Step 2: Check Backend Logs

When you approve an order, look for these log patterns:

**✅ Success Pattern:**
```
✅ Approval confirmation sent to owner for order <order-id>
   Resend response: {"id":"<email-id>"}
✅ Approval email sent to customer <email>
   Resend response: {"id":"<email-id>"}
```

**❌ Failure Pattern:**
```
✅ Approval confirmation sent to owner for order <order-id>
❌ Failed to send approval confirmation to owner:
   Error details: {...}
```

**⚠️ False Success (Bug):**
If you see the success message but NO Resend response, the email likely failed silently.

## Common Issues and Solutions

### Issue 1: "Missing RESEND_API_KEY"

**Symptom:** Backend crashes on startup with error about missing API key.

**Solution:**
1. Create/edit `/backend/.env` file
2. Add: `RESEND_API_KEY=re_your_actual_key`
3. Get your key from: https://resend.com/api-keys
4. Restart backend: `npm run dev`

### Issue 2: "Domain not verified"

**Symptom:** Emails fail with error about unverified domain.

**Solution:**

**Option A - Use a Verified Email Address (Quickest):**
1. Add `FROM_EMAIL=your-verified-email@gmail.com` to `/backend/.env`
2. This email must be verified in your Resend account
3. Restart backend: `npm run dev`

**Option B - Use Resend Test Domain (Development):**
1. Go to https://resend.com/domains
2. Use the provided test domain (e.g., `onboarding@resend.dev`)
3. Add `FROM_EMAIL=onboarding@resend.dev` to `/backend/.env`
4. Restart backend: `npm run dev`

**Option C - Verify Your Domain (Production):**
1. Go to https://resend.com/domains
2. Add your domain (e.g., `gioscorner.com`)
3. Add the DNS records shown in Resend dashboard
4. Wait for verification (can take up to 48 hours)
5. Add `FROM_EMAIL=orders@gioscorner.com` to `/backend/.env`
6. Restart backend: `npm run dev`

### Issue 3: Success Logs But No Email Received

**Symptom:** You see "✅ Email sent" in logs but no email arrives.

**Possible Causes:**

1. **Email in Spam/Junk Folder**
   - Check spam folder
   - Mark Resend emails as "Not Spam"

2. **Wrong OWNER_EMAIL**
   - Verify `OWNER_EMAIL` in `.env` is correct
   - Check for typos

3. **Resend API Key Invalid**
   - Regenerate API key in Resend dashboard
   - Update `.env` file
   - Restart backend

4. **Rate Limiting**
   - Check Resend dashboard for rate limit errors
   - Free tier: 100 emails/day, 3,000/month

5. **Resend Service Issue**
   - Check Resend status: https://resend.com/status
   - Check Resend logs: https://resend.com/emails

### Issue 4: No Logs at All

**Symptom:** No email-related logs appear when approving orders.

**Solution:**
1. Check if backend is running: `cd backend && npm run dev`
2. Check browser console for API errors
3. Verify admin dashboard is connected to correct backend URL
4. Check `VITE_API_URL` in frontend `.env`

## Resend Configuration Checklist

- [ ] **API Key Set:** `RESEND_API_KEY` in `/backend/.env`
- [ ] **Owner Email Set:** `OWNER_EMAIL` in `/backend/.env`
- [ ] **From Email Set:** `FROM_EMAIL` in `/backend/.env` (defaults to `taragiord@gmail.com`)
- [ ] **From Email Verified:** The email in `FROM_EMAIL` is verified in Resend
- [ ] **API Key Valid:** Test with `node test-resend.js`
- [ ] **Backend Running:** Server is running on correct port
- [ ] **No Rate Limits:** Check Resend dashboard for limits

## Testing Email Flow

### Test 1: New Order Email
```bash
# Create a test order through the frontend
# Check logs for:
✅ New order notification sent to owner for order <id>
   Resend response: {"id":"..."}
✅ Pending notification sent to customer <email>
   Resend response: {"id":"..."}
```

### Test 2: Approval Email
```bash
# Approve an order in admin dashboard
# Check logs for:
✅ Approval confirmation sent to owner for order <id>
   Resend response: {"id":"..."}
✅ Approval email sent to customer <email>
   Resend response: {"id":"..."}
```

### Test 3: Invoice Email
```bash
# Confirm time and send invoice
# Check logs for:
✅ Invoice email sent to customer <email>
   Resend response: {"id":"..."}
```

## Advanced Debugging

### Enable Verbose Logging

The email service now logs detailed error information. Check backend logs for:

```
❌ Failed to send approval email to customer:
   Error details: {
     "statusCode": 403,
     "message": "Domain not verified",
     ...
   }
```

### Check Resend Dashboard

1. Go to https://resend.com/emails
2. View recent email attempts
3. Check delivery status
4. View error messages

### Test with cURL

Test Resend API directly:

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "orders@gioscorner.com",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

## Environment Variable Reference

Required in `/backend/.env`:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_resend_api_key_here

# Email Configuration
OWNER_EMAIL=your-email@example.com
FROM_EMAIL=your-verified-email@example.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

**Note:** If `FROM_EMAIL` is not set, it defaults to `taragiord@gmail.com`

## Getting Help

If you're still having issues:

1. **Run the test script:** `node test-resend.js`
2. **Check Resend logs:** https://resend.com/emails
3. **Verify domain:** https://resend.com/domains
4. **Check API key:** https://resend.com/api-keys
5. **Review backend logs:** Look for detailed error messages

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Missing RESEND_API_KEY` | API key not in .env | Add `RESEND_API_KEY` to `/backend/.env` |
| `Domain not verified` | Email domain not verified | Verify domain in Resend dashboard |
| `Invalid API key` | Wrong or expired API key | Generate new key in Resend dashboard |
| `Rate limit exceeded` | Too many emails sent | Wait or upgrade Resend plan |
| `Invalid recipient` | Email address format wrong | Check email address format |

## Resend Free Tier Limits

- **100 emails per day**
- **3,000 emails per month**
- **1 verified domain**
- **Unlimited API keys**

If you hit these limits, consider upgrading to a paid plan.

## Production Checklist

Before going live:

- [ ] Verify your custom domain in Resend
- [ ] Update `from` address to use your domain
- [ ] Test all email types (new order, approval, invoice, denial)
- [ ] Set up email monitoring/alerts
- [ ] Configure SPF/DKIM records for better deliverability
- [ ] Test with multiple email providers (Gmail, Outlook, etc.)
- [ ] Set up proper error handling and logging
- [ ] Consider upgrading Resend plan for higher limits

## Support Resources

- **Resend Documentation:** https://resend.com/docs
- **Resend Status:** https://resend.com/status
- **Resend Support:** https://resend.com/support
- **Resend Community:** https://resend.com/community

