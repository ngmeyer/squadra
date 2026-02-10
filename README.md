# Squadra - Group Shopping Platform

Squadra is a modern group shopping platform built with Next.js, Supabase, and Stripe. It enables organizers to create campaigns where customers can pool orders together for group discounts or special pricing.

## 🚀 Features

- **Multi-Store Management**: Create and manage multiple stores with custom branding
- **Campaign System**: Launch time-bound shopping campaigns with custom products
- **Product Variants**: Support for multiple product variants (size, color, etc.)
- **Stripe Integration**: Secure payment processing with Stripe
- **Order Management**: Track and fulfill orders with bulk operations
- **Email Notifications**: Automated order confirmations and shipping notifications
- **Analytics Dashboard**: Campaign performance metrics and insights
- **Mobile Responsive**: Works seamlessly on all devices

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Stripe account (test mode is fine for development)
- A Resend account (for email notifications)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd squadra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Resend (Email)
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Cron Secret (optional, for auto-updating campaign statuses)
   CRON_SECRET=your_random_secret_string
   ```

4. **Set up the database**
   
   Run the database setup script:
   ```bash
   npm run db:setup
   ```
   
   This will create all necessary tables and relationships in your Supabase project.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
squadra/
├── app/                      # Next.js App Router pages
│   ├── (admin)/             # Admin dashboard routes
│   │   ├── campaigns/       # Campaign management
│   │   ├── orders/          # Order management
│   │   ├── stores/          # Store management
│   │   └── settings/        # User settings
│   ├── (storefront)/        # Public storefront
│   ├── api/                 # API routes
│   └── auth/                # Authentication
├── components/              # React components
│   ├── ui/                  # UI primitives (shadcn/ui)
│   ├── campaigns/           # Campaign components
│   ├── orders/              # Order components
│   └── stores/              # Store components
├── lib/                     # Utility libraries
│   ├── supabase/           # Supabase client & queries
│   ├── email/              # Email templates & client
│   └── utils/              # Utility functions
└── public/                  # Static assets
```

## 🗄️ Database Schema

The application uses the following main tables:

- **stores**: Store information and settings
- **campaigns**: Group shopping campaigns
- **campaign_products**: Products within campaigns
- **variants**: Product variants (size, color, etc.)
- **orders**: Customer orders
- **order_items**: Individual items in orders

See `supabase/schema.sql` for the complete schema.

## 🔐 Authentication

Squadra uses Supabase Auth for user authentication. Users can:

- Sign up with email/password
- Log in to access the admin dashboard
- Manage multiple stores under one account

Row Level Security (RLS) policies ensure users can only access their own data.

## 💳 Payment Processing

Payments are processed through Stripe:

1. Customer adds items to cart
2. Checkout page creates a Stripe Payment Intent
3. Customer completes payment
4. Stripe webhook confirms payment
5. Order is marked as "paid" and confirmation email is sent

## 📧 Email Notifications

Email notifications are sent via Resend:

- **Order Confirmation**: Sent when payment is successful
- **Shipping Notification**: Sent when order is marked as shipped

Email templates are built with React Email and located in `lib/email/templates/`.

## 🔄 Campaign Status Updates

Campaigns can have the following statuses:

- **Draft**: Campaign is being prepared
- **Active**: Campaign is open for orders
- **Closed**: Campaign has ended
- **Archived**: Campaign is archived

To automatically update campaign statuses based on dates, set up a cron job to call:
```
GET /api/cron/update-campaign-status
Authorization: Bearer YOUR_CRON_SECRET
```

Or use Vercel Cron (see `DEPLOYMENT.md`).

## 📊 Analytics

Each campaign has an analytics page showing:

- Total orders and revenue
- Average order value
- Orders over time (chart)
- Top-selling products
- Variant inventory status

Access via: `/campaigns/[id]/analytics`

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:

- Vercel
- Supabase configuration
- Stripe webhook setup
- Custom domain setup

## 🧪 Testing

### End-to-End Test Checklist

1. ✅ Create a store
2. ✅ Create a campaign
3. ✅ Add products with variants
4. ✅ View storefront as customer
5. ✅ Add items to cart
6. ✅ Complete checkout (use Stripe test cards)
7. ✅ Receive order confirmation email
8. ✅ View order in admin dashboard
9. ✅ Mark order as shipped
10. ✅ Receive shipping notification email
11. ✅ Export orders to CSV
12. ✅ View campaign analytics

### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Set up database schema
- `npm run db:types` - Generate TypeScript types from Supabase

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

[MIT License](LICENSE)

## 🆘 Support

For issues and questions:

- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the deployment guide in `DEPLOYMENT.md`

## 🎯 Roadmap

- [ ] Self-service store signup
- [ ] Tiered pricing based on quantity
- [ ] Product inventory management
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Webhook integrations
- [ ] API for third-party integrations

---

Built with ❤️ using Next.js, Supabase, Stripe, and Resend.
