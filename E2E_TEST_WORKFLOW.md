# Squadra E2E Test Workflow
## Complete End-to-End Testing Guide

**Purpose:** Validate full store → customer → order flow before production launch
**Time Required:** 45-60 minutes
**Prerequisites:** Stripe test account, Resend API key configured

---

## 🔴 CRITICAL: Tax Configuration

**Current State:** Squadra uses Stripe for payments, but tax calculation is **store-owner responsibility**

**What needs testing:**
- [ ] Does Stripe Checkout collect tax? (if enabled)
- [ ] Is tax shown separately in order receipt?
- [ ] Does order total match what customer paid?
- [ ] Are tax settings per-store isolated?

**⚠️ Tax Risks for MVP:**
- Each store must configure their own Stripe Tax or external tax provider
- Squadra doesn't calculate tax (no built-in tax engine)
- Store owners must set tax rates in Stripe Dashboard
- **Recommendation:** Test with $0 tax first, document tax requirements for store owners

---

## Pre-Test Setup

### 1. Environment Checklist
- [ ] Squadra deployed at `https://squadra-azure.vercel.app`
- [ ] Supabase database connected
- [ ] Resend API key configured (for emails)
- [ ] Stripe Connect OAuth configured

### 2. Test Accounts Needed
- [ ] **Store Owner Account:** Your email (for Gearu)
- [ ] **Customer Account:** Different email (friend/family member)
- [ ] **Stripe Test Account:** Or real account with test mode

### 3. Stripe Test Keys
```
Publishable Key: pk_test_...
Secret Key: sk_test_...
Webhook Secret: whsec_... (for local testing)

Test Card: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
ZIP: Any valid ZIP
```

---

## Phase 1: Store Owner Setup (15 min)

### Step 1.1: Create Store
1. Navigate to `https://squadra-azure.vercel.app`
2. Click "Create Store"
3. Fill in:
   - Store Name: "Gearu Test Shop"
   - Slug: "gearutest" (or custom)
   - Description: "Test store for E2E validation"
4. Complete store creation
5. **Verify:** Store URL works: `https://squadra-azure.vercel.app/[slug]`

**📝 Note Result:** Store slug: _______________

### Step 1.2: Configure Stripe Connect (CRITICAL)
1. Go to Store Settings → Payments
2. Click "Connect with Stripe"
3. Complete Stripe OAuth flow with **your Stripe account**
4. **Verify:** Stripe shows "Connected" status
5. **Important:** Enable test mode if using test keys

**📝 Note Result:** Stripe account connected: ⬜ Yes ⬜ No

### Step 1.3: Configure Tax Settings (If Applicable)
1. In Stripe Dashboard → Settings → Tax
2. Choose approach:
   - **Option A:** Stripe Tax (automatic calculation, costs extra)
   - **Option B:** Manual tax rates (free, you define rates)
   - **Option C:** Tax included in price (no separate tax line)
3. For MVP testing, use **Option C** (tax included in price)
   - This avoids complexity
   - Document for store owners they need to handle tax separately

**📝 Tax Approach Used:** _______________

### Step 1.4: Add Store Branding (Optional)
1. Upload logo
2. Set primary/secondary colors
3. **Verify:** Branding shows on storefront

---

## Phase 2: Product & Campaign Setup (15 min)

### Step 2.1: Create Product
1. Go to Products → Add New
2. Fill in:
   - Name: "Test T-Shirt"
   - Description: "Cotton crew neck"
   - Price: $25.00
   - SKU: "TS-001"
   - Inventory: 50 units
3. **Verify:** Product saves successfully

### Step 2.2: Add Product Variants
1. Edit product → Variants
2. Add variant: Size
   - Small, Medium, Large, XL
   - Price adjustment: $0 (same price)
   - Inventory per variant: 10 each
3. **Verify:** Variants save and show on storefront

**📝 Note Result:** Variants working: ⬜ Yes ⬜ No

### Step 2.3: Create Campaign
1. Go to Campaigns → New Campaign
2. Fill in:
   - Name: "Test Campaign - February"
   - Description: "Group buying campaign"
   - Start Date: Today
   - End Date: Today + 7 days
   - Products: Select "Test T-Shirt"
3. Configure Pricing Tiers:
   - Tier 1: 1-10 orders → $25.00
   - Tier 2: 11-25 orders → $22.00
   - Tier 3: 26+ orders → $20.00
4. **Verify:** Campaign saves and activates

### Step 2.4: Preview Storefront
1. Go to campaign → View Public Page
2. **Verify:**
   - [ ] Product image displays
   - [ ] Price tiers show correctly
   - [ ] Variant selector works
   - [ ] Progress bar shows 0/10 for tier 1
   - [ ] "Join Campaign" button visible

**📝 URL of storefront:** _______________

---

## Phase 3: Customer Purchase Flow (15 min)

### Step 3.1: As Customer (Use Different Browser/Device)
1. Navigate to campaign URL
2. Select variant (e.g., "Large")
3. Quantity: 1
4. Click "Join Campaign"
5. Fill customer details:
   - Name: "Test Customer"
   - Email: [different from store owner]
6. Click "Continue to Payment"

**📝 Note Result:** Cart shows: $25.00 (or with tax if configured)

### Step 3.2: Complete Stripe Checkout
1. On Stripe Checkout page, verify:
   - [ ] Product name correct
   - [ ] Amount matches tier
   - [ ] Tax line visible (if applicable)
   - [ ] Total correct
2. Enter test card: `4242 4242 4242 4242`
3. Any future expiry, any CVV
4. Complete purchase

**📝 Note Result:** Payment successful: ⬜ Yes ⬜ No

### Step 3.3: Verify Confirmation Page
1. After Stripe redirect, should see:
   - Order confirmation number
   - Thank you message
   - Order summary
   - "Share with friends" CTA

**📝 Order Number:** _______________

---

## Phase 4: Email Verification (5 min)

### Step 4.1: Customer Email
Check customer email inbox for:
- [ ] Order confirmation email
- [ ] Subject line includes order number
- [ ] Email contains:
  - Order details
  - Product name, variant, quantity
  - Price breakdown (subtotal, tax, total)
  - Campaign details
  - "View Order" link

**⏰ Wait Time:** Up to 2 minutes for email delivery

**📝 Note Result:** Customer email received: ⬜ Yes ⬜ No

### Step 4.2: Store Owner Email
Check store owner email for:
- [ ] New order notification
- [ ] Subject: "New Order Received"
- [ ] Contains:
  - Order number
  - Customer details
  - Product details
  - Amount paid
  - Link to admin order page

**📝 Note Result:** Store owner email received: ⬜ Yes ⬜ No

---

## Phase 5: Admin Dashboard Verification (5 min)

### Step 5.1: Order Appears in Dashboard
1. As store owner, go to `/admin/orders`
2. **Verify:**
   - [ ] Order number matches confirmation
   - [ ] Customer name/email correct
   - [ ] Product: "Test T-Shirt"
   - [ ] Variant: "Large"
   - [ ] Status: "Paid" or "Confirmed"
   - [ ] Amount matches: $25.00

### Step 5.2: Order Detail Page
1. Click on order
2. **Verify:**
   - [ ] Full customer info
   - [ ] Payment status: Succeeded
   - [ ] Stripe payment intent ID present
   - [ ] Timestamp accurate
   - [ ] Action buttons: Mark Fulfilled, Issue Refund

### Step 5.3: Campaign Progress Updated
1. Go to Campaign → View
2. **Verify:**
   - [ ] Order count shows 1
   - [ ] Progress bar updated (1/10)
   - [ ] Next tier shows remaining orders needed

---

## Phase 6: Fulfillment Simulation (Optional, 5 min)

### Step 6.1: Mark Order Fulfilled
1. On order detail page, click "Mark as Fulfilled"
2. Add tracking number (optional): "TEST123"
3. Save

**📝 Note Result:** Fulfillment email triggered: ⬜ Yes ⬜ No

### Step 6.2: Fulfillment Email
Check customer email for:
- [ ] "Your order has shipped" notification
- [ ] Tracking number included
- [ ] Expected delivery timeframe

---

## Phase 7: Multi-Customer Scenario (Optional, 10 min)

### Test Tier Pricing Logic
1. **Customer A:** Buys 1 item (Tier 1: $25)
2. **Customer B:** Buys 1 item (Tier 2 now active: $22 for both)
3. **Verify:**
   - Customer A charged: $25 (already paid)
   - Customer B charged: $22
   - Or if auto-adjust: Both charged $22 (check Stripe refunds)

**⚠️ This tests campaign logic complexity**

---

## Tax-Specific Tests (If Applicable)

### Scenario A: No Tax (Included in Price)
- Expect: No tax line on checkout
- Order total = $25.00
- Customer pays exactly $25.00

### Scenario B: Tax Added at Checkout
- Expect: Tax line visible on Stripe checkout
- Order total = $25.00 + tax
- Customer pays $25.00 + tax
- Email shows tax breakdown

### Scenario C: Different States/Countries
- **Test if you need multi-region support**
- Creates complexity for MVP
- **Recommendation:** Skip for MVP, add later

---

## Post-Test: Data Cleanup

### Important: Clean Up Test Data
1. **Refund test payment** (if real money used)
   - In Stripe Dashboard → Refunds
   - Or use Squadra "Issue Refund" button
2. **Mark test orders** as "Test Only" in notes
3. **Optional:** Delete test products/campaigns

### Keep Test Records
- Screenshot order confirmation
- Screenshot admin dashboard
- Save order number

---

## ⚠️ Known Issues to Watch For

| Issue | Expected | Actual | Notes |
|-------|----------|--------|-------|
| Payment succeeds but order not created | - | - | Check webhook delivery |
| Email not received | - | - | Check Resend dashboard, spam folder |
| Wrong price tier charged | - | - | Verify campaign settings |
| Tax calculated twice | - | - | Check Stripe settings |
| Order not in admin | - | - | Check Supabase connection |

---

## Success Criteria

**✅ Test Passes If:**
- [ ] Store created successfully
- [ ] Stripe Connected verified
- [ ] Product with variants added
- [ ] Campaign created with pricing tiers
- [ ] Customer can browse storefront
- [ ] Checkout completes via Stripe
- [ ] Customer receives confirmation email
- [ ] Store owner receives order notification
- [ ] Order appears in admin dashboard
- [ ] Order details match purchase
- [ ] Campaign progress updated
- [ ] **If tax enabled:** Tax calculated correctly

**❌ Blockers For Production:**
- Any payment not recorded in admin
- Any confirmation email not sent
- Order totals don't match payment
- Tax calculation errors

---

## Next Steps After Successful Test

1. **Production Domain:** Purchase `squadrashop.com` or similar
2. **Monitoring:** Add Sentry for error tracking
3. **Analytics:** Add Clarity for session recordings
4. **Stripe Live Keys:** Switch from test to live mode
5. **First Real Store:** Gearu launch

---

## Appendix: Stripe Webhook Verification

**If payments succeed but orders not created, check webhooks:**

1. Stripe Dashboard → Developers → Webhooks
2. Verify endpoint: `[your-domain]/api/stripe/webhook`
3. Recent events should show `payment_intent.succeeded`
4. Check webhook delivery status

**Local Testing:**
```bash
# Use Stripe CLI to forward webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

*Last Updated: February 14, 2026*
*Test Owner: Neal*
*Test Priority: CRITICAL for MVP launch*
