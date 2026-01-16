# Resend Email Setup Guide

## The Issue

Resend **does not allow** sending emails from `@gmail.com`, `@yahoo.com`, or other public email providers. You'll get this error:

```
The gmail.com domain is not verified. Please, add and verify your domain
```

## Quick Solution for Development

Use Resend's **test domain** which is pre-verified and works immediately:

### Step 1: Update Your `.env` File

Add this to `/backend/.env`:

```bash
FROM_EMAIL=onboarding@resend.dev
```

### Step 2: Restart Backend

```bash
cd /Users/owengiordano/Documents/gios-corner/backend
npm run dev
```

### Step 3: Test It

```bash
node test-resend.js
```

You should now see emails being sent successfully! ✅

## Important Notes About Test Domain

- ✅ **Works immediately** - no setup required
- ✅ **Perfect for development** and testing
- ⚠️ **Emails may go to spam** - this is normal for test domains
- ⚠️ **Shows "onboarding@resend.dev"** as sender
- ❌ **Not suitable for production** - customers will see the test domain

## Production Solution: Verify Your Own Domain

For production, you'll want to use your own domain (e.g., `orders@gioscorner.com`).

### Step 1: Add Your Domain in Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `gioscorner.com` (without www or http)
4. Click **"Add"**

### Step 2: Add DNS Records

Resend will show you DNS records to add. You need to add these to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**Example records you'll need to add:**

| Type | Name | Value |
|------|------|-------|
| TXT | @ | `resend-verification=abc123...` |
| MX | @ | `feedback-smtp.us-east-1.amazonses.com` (Priority: 10) |
| TXT | resend._domainkey | `p=MIGfMA0GCSqGSIb3...` |

### Step 3: Wait for Verification

- DNS changes can take **up to 48 hours** to propagate
- Usually happens within **15-30 minutes**
- Check status at https://resend.com/domains

### Step 4: Update Your `.env`

Once verified, update `/backend/.env`:

```bash
FROM_EMAIL=orders@gioscorner.com
```

### Step 5: Restart Backend

```bash
npm run dev
```

## Alternative: Use a Subdomain

If you don't want to verify your main domain, use a subdomain:

1. Add domain in Resend: `mail.gioscorner.com`
2. Add DNS records for the subdomain
3. Use: `FROM_EMAIL=orders@mail.gioscorner.com`

## Checking Your Current Setup

Run the test script to see what's configured:

```bash
cd /Users/owengiordano/Documents/gios-corner/backend
node test-resend.js
```

This will show:
- ✅ Your current FROM_EMAIL setting
- ✅ Available verified domains
- ✅ Whether test email sends successfully

## Troubleshooting

### Error: "Domain not verified"

**Solution:** Use the test domain for now:
```bash
FROM_EMAIL=onboarding@resend.dev
```

### Error: "Invalid from address"

**Solution:** Make sure FROM_EMAIL is a valid email format:
```bash
# ✅ Good
FROM_EMAIL=onboarding@resend.dev
FROM_EMAIL=orders@gioscorner.com

# ❌ Bad
FROM_EMAIL=gioscorner.com
FROM_EMAIL=orders
```

### Emails Going to Spam

**For Test Domain:**
- This is normal - test domains have lower reputation
- Check spam folder during development

**For Your Domain:**
- Make sure all DNS records are added correctly
- Add SPF, DKIM, and DMARC records (Resend provides these)
- Warm up your domain by sending gradually increasing volumes

### Can't Verify Domain

**Common issues:**
1. **DNS not propagated yet** - Wait 24-48 hours
2. **Wrong DNS records** - Double-check values in Resend dashboard
3. **Using www subdomain** - Use root domain (`gioscorner.com` not `www.gioscorner.com`)
4. **DNS provider issues** - Some providers have special requirements

## Recommended Setup Path

### For Development (Right Now)

```bash
# In /backend/.env
FROM_EMAIL=onboarding@resend.dev
OWNER_EMAIL=taragiord@gmail.com
```

This will work **immediately** with no additional setup.

### For Production (Later)

```bash
# In /backend/.env
FROM_EMAIL=orders@gioscorner.com
OWNER_EMAIL=taragiord@gmail.com
```

After verifying `gioscorner.com` domain in Resend.

## Testing Your Setup

### Test 1: Run Diagnostic Script

```bash
cd /Users/owengiordano/Documents/gios-corner/backend
node test-resend.js
```

Expected output:
```
✅ Email sent successfully!

Response from Resend:
{
  "data": {
    "id": "abc123-def456-ghi789"
  },
  "error": null
}
```

### Test 2: Check Email Delivery

1. Check inbox at `OWNER_EMAIL` address
2. Check spam folder if not in inbox
3. Look for email from `onboarding@resend.dev` (or your domain)

### Test 3: Approve an Order

1. Create a test order through frontend
2. Approve it in admin dashboard
3. Check backend logs for:
   ```
   ✅ Approval email sent to customer
      Resend response: {"id":"..."}
   ```
4. Check customer email inbox

## FAQ

**Q: Can I use my Gmail address to send emails?**  
A: No, Resend doesn't allow public email providers. Use `onboarding@resend.dev` for testing.

**Q: How much does domain verification cost?**  
A: Free! Resend's free tier includes 1 verified domain.

**Q: Can I use multiple domains?**  
A: Yes, but you need a paid plan for more than 1 domain.

**Q: What if I don't own a domain?**  
A: Use `onboarding@resend.dev` for development. For production, you'll need to purchase a domain.

**Q: How do I buy a domain?**  
A: Use registrars like:
- Namecheap (recommended, easy DNS)
- GoDaddy
- Google Domains
- Cloudflare

**Q: Will customers see the test domain?**  
A: Yes, emails will show "from: onboarding@resend.dev". For production, verify your own domain.

## Current Default Settings

After my fixes:

```typescript
// backend/src/config/email.ts
export const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
```

This means:
- ✅ Works out of the box with no configuration
- ✅ No domain verification needed for development
- ✅ Emails will send successfully
- ⚠️ Shows "onboarding@resend.dev" as sender

## Next Steps

1. **Right now:** Use `FROM_EMAIL=onboarding@resend.dev` (already the default)
2. **Restart backend:** `npm run dev`
3. **Test it:** `node test-resend.js`
4. **Later:** Verify your domain for production

That's it! Your emails should work now. 🎉

## Support

- **Resend Docs:** https://resend.com/docs/send-with-nodejs
- **Domain Verification:** https://resend.com/docs/dashboard/domains/introduction
- **DNS Help:** https://resend.com/docs/dashboard/domains/dns-providers



