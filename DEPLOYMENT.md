# Deployment Guide - Squadra

This guide will walk you through deploying Squadra to production.

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] A Vercel account (recommended hosting platform)
- [ ] A Supabase account with a production project
- [ ] A Stripe account (production mode)
- [ ] A Resend account for email delivery
- [ ] A custom domain (optional but recommended)

## 🚀 Step 1: Supabase Setup

### 1.1 Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose a strong database password
4. Select a region close to your users
5. Wait for project to be provisioned

### 1.2 Set Up Database Schema

1. Navigate to the SQL Editor in your Supabase project
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL script to create all tables and policies
4. Verify tables are created in the Table Editor

### 1.3 Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates:
   - Customize confirmation email
   - Set sender name
   - Add your logo (optional)

### 1.4 Configure Storage (Optional)

If you plan to store product images in Supabase Storage:

1. Go to Storage
2. Create a new bucket called `product-images`
3. Set it to public
4. Add RLS policies for upload permissions

### 1.5 Get API Keys

1. Go to Settings → API
2. Copy these values (you'll need them for Vercel):
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secure!)

## 💳 Step 2: Stripe Setup

### 2.1 Activate Production Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete your business profile
3. Activate your account (may require identity verification)
4. Switch to "Production" mode (toggle in sidebar)

### 2.2 Get API Keys

1. Go to Developers → API keys
2. Copy:
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)
3. Keep these secure - you'll add them to Vercel

### 2.3 Configure Webhook Endpoint

You'll set this up after deploying to Vercel (Step 4).

## 📧 Step 3: Resend Setup

### 3.1 Verify Domain

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain registrar:
   - SPF record
   - DKIM record
5. Wait for verification (usually takes a few minutes)

### 3.2 Get API Key

1. Go to API Keys
2. Create a new API key
3. Copy the key (starts with `re_`)
4. Keep it secure

### 3.3 Set From Address

You'll send emails from an address like:
- `noreply@yourdomain.com`
- `orders@yourdomain.com`

Make sure this domain matches the one you verified.

## 🌐 Step 4: Vercel Deployment

### 4.1 Push to GitHub

1. Initialize git repository (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/squadra.git
   git branch -M main
   git push -u origin main
   ```

### 4.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: (leave default)

### 4.3 Set Environment Variables

Add the following environment variables in Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=(leave empty for now - will add after webhook setup)

# Resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_string_here
```

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-app.vercel.app`

## 🔗 Step 5: Stripe Webhook Configuration

Now that your app is deployed, configure the Stripe webhook:

### 5.1 Create Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"

### 5.2 Get Webhook Secret

1. Click on your newly created webhook
2. Copy the "Signing secret" (starts with `whsec_`)
3. Go back to Vercel → Your Project → Settings → Environment Variables
4. Add/update `STRIPE_WEBHOOK_SECRET` with this value
5. Redeploy your app (Vercel will prompt you)

### 5.3 Test Webhook

1. In Stripe Dashboard, click "Send test webhook"
2. Select `payment_intent.succeeded`
3. Verify it succeeds (check Vercel logs if issues)

## 🌍 Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to your project → Settings → Domains
2. Add your domain (e.g., `squadra.com`)
3. Vercel will provide DNS records

### 6.2 Update DNS

Add these records to your domain registrar:

**For root domain (squadra.com):**
- Type: A
- Name: @
- Value: 76.76.21.21

**For www subdomain:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

### 6.3 Update Environment Variables

1. Go to Vercel → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your custom domain
3. Redeploy

### 6.4 Update Stripe & Supabase

1. **Stripe**: Update webhook URL to use your custom domain
2. **Supabase**: Add your domain to "Redirect URLs" in Authentication settings

## ⏰ Step 7: Set Up Cron Jobs

To automatically update campaign statuses (draft → active → closed):

### 7.1 Create Vercel Cron Job

1. Create `vercel.json` in your project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/update-campaign-status",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```
   This runs every hour.

2. Commit and push:
   ```bash
   git add vercel.json
   git commit -m "Add cron job for campaign status updates"
   git push
   ```

3. Vercel will automatically detect and enable the cron job

### 7.2 Manual Testing

You can manually trigger the cron endpoint:

```bash
curl -X GET https://your-app.vercel.app/api/cron/update-campaign-status \
  -H "Authorization: Bearer your_cron_secret"
```

## 🔒 Step 8: Security Checklist

Before going live, verify:

- [ ] All API keys are in environment variables (not in code)
- [ ] Supabase RLS policies are enabled and tested
- [ ] Stripe is in production mode
- [ ] Webhook signatures are verified
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (Vercel has built-in DDoS protection)
- [ ] Error messages don't leak sensitive information

## 📊 Step 9: Monitoring & Analytics

### 9.1 Vercel Analytics

1. Enable Vercel Analytics in your project settings
2. Monitor page load times and Core Web Vitals

### 9.2 Error Tracking (Optional)

Consider integrating:
- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **PostHog**: For product analytics

### 9.3 Uptime Monitoring

Set up uptime monitoring with:
- **Vercel Status Checks**: Built-in monitoring
- **UptimeRobot**: Free external monitoring
- **Better Stack**: Advanced monitoring

## 🧪 Step 10: Post-Deployment Testing

Run through the complete user flow:

1. ✅ Create a store
2. ✅ Create a campaign
3. ✅ Add products with variants
4. ✅ View storefront (share link with a test user)
5. ✅ Complete a real purchase (with real Stripe card)
6. ✅ Verify order confirmation email
7. ✅ Mark order as shipped in admin
8. ✅ Verify shipping notification email
9. ✅ Check analytics page
10. ✅ Test on mobile devices

## 🚨 Troubleshooting

### Build Fails on Vercel

- Check build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct: `npm run build` locally

### Emails Not Sending

- Verify Resend domain is verified
- Check API key is correct
- Look at Resend logs for errors
- Ensure `RESEND_FROM_EMAIL` matches verified domain

### Stripe Webhook Fails

- Verify webhook secret is correct
- Check webhook is pointing to correct URL
- Test webhook with Stripe's "Send test webhook" tool
- Check Vercel function logs

### Database Queries Fail

- Verify RLS policies allow the operations
- Check Supabase logs
- Ensure `service_role` key is used for admin operations

### CSS Not Loading

- Clear browser cache
- Check Vercel build logs
- Verify Tailwind CSS is configured correctly

## 📈 Scaling Considerations

As your app grows:

1. **Database**: Upgrade Supabase plan as needed
2. **Vercel**: Consider Pro plan for better performance
3. **Stripe**: Monitor transaction volume and fees
4. **CDN**: Use Vercel's Edge Network (automatic)
5. **Caching**: Implement Redis for frequently accessed data

## 🔄 Continuous Deployment

With Vercel + GitHub:

1. Every push to `main` automatically deploys to production
2. Pull requests get preview deployments
3. Set up branch protections to require reviews

## 📞 Support Resources

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Resend Support**: [resend.com/support](https://resend.com/support)

---

## ✅ Deployment Complete!

Your Squadra instance is now live! 🎉

Remember to:
- Keep your API keys secure
- Monitor error logs regularly
- Back up your database
- Test new features thoroughly before deploying

Need help? Open an issue on GitHub or consult the documentation.
