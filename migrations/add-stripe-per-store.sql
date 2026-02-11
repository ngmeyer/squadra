-- Squadra: Multi-tenant Stripe Setup
-- Run this in Supabase SQL Editor for dnsrrddirtfzwdwuezpk project

-- Add Stripe fields to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_account_email TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_stripe_account_id ON stores(stripe_account_id);

-- Add comment documenting the columns
COMMENT ON COLUMN stores.stripe_publishable_key IS 'Store Stripe publishable key (safe to expose to frontend)';
COMMENT ON COLUMN stores.stripe_secret_key IS 'Store Stripe secret key (PRIVATE - encrypted at rest)';
COMMENT ON COLUMN stores.stripe_webhook_secret IS 'Store Stripe webhook secret (PRIVATE - encrypted at rest)';
COMMENT ON COLUMN stores.stripe_connected IS 'Whether Stripe account is fully connected and validated';
COMMENT ON COLUMN stores.stripe_account_email IS 'Email of the Stripe account holder';
COMMENT ON COLUMN stores.stripe_account_id IS 'Stripe Account ID (acct_...)';

-- Update RLS policies if needed
-- (stores table should already have proper RLS)

-- Verify schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stores' AND column_name LIKE 'stripe%';
