-- Squadra Database Schema
-- Multi-tenant storefront platform for preorder campaigns

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Campaign status lifecycle
CREATE TYPE campaign_status AS ENUM (
  'draft',      -- Being set up
  'active',     -- Open for orders
  'closed',     -- Preorder deadline passed
  'archived'    -- Campaign completed/archived
);

-- Product status
CREATE TYPE product_status AS ENUM (
  'draft',      -- Being set up
  'active',     -- Available for ordering
  'hidden'      -- Temporarily hidden
);

-- Order status
CREATE TYPE order_status AS ENUM (
  'pending',    -- Payment initiated
  'paid',       -- Payment confirmed
  'shipped',    -- Order shipped
  'cancelled'   -- Order cancelled
);

-- Customization type
CREATE TYPE customization_type AS ENUM (
  'none',       -- No customization
  'optional',   -- Customer can optionally add
  'required'    -- Customer must provide
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Stores (Multi-tenant)
-- -----------------------------------------------------------------------------
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  theme_colors JSONB DEFAULT '{"primary": "#0f172a", "secondary": "#64748b"}'::jsonb,
  contact_email TEXT NOT NULL,
  shipping_policy TEXT,
  tax_rate DECIMAL(5,4) DEFAULT 0.0000,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for slug lookups (used in storefront URLs)
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_created_by ON stores(created_by);

-- -----------------------------------------------------------------------------
-- Campaigns
-- -----------------------------------------------------------------------------
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  ships_at TIMESTAMPTZ,
  ship_to_name TEXT NOT NULL,
  ship_to_address TEXT NOT NULL,
  ship_to_phone TEXT NOT NULL,
  custom_message TEXT,
  status campaign_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, slug),
  CONSTRAINT valid_dates CHECK (closes_at > opens_at)
);

-- Indexes
CREATE INDEX idx_campaigns_store_id ON campaigns(store_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_store_slug ON campaigns(store_id, slug);

-- -----------------------------------------------------------------------------
-- Campaign Products
-- -----------------------------------------------------------------------------
CREATE TABLE campaign_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  base_price_cents INTEGER NOT NULL,
  category TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  variant_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  customization_config JSONB NOT NULL DEFAULT '{
    "type": "none",
    "label": "",
    "placeholder": "",
    "max_length": 0,
    "price_cents": 0
  }'::jsonb,
  status product_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  total_ordered INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaign_products_campaign_id ON campaign_products(campaign_id);
CREATE INDEX idx_campaign_products_status ON campaign_products(status);
CREATE INDEX idx_campaign_products_sort ON campaign_products(campaign_id, sort_order);

-- -----------------------------------------------------------------------------
-- Product Variants
-- -----------------------------------------------------------------------------
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_product_id UUID NOT NULL REFERENCES campaign_products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  option_combo JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  total_ordered INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_variants_product_id ON variants(campaign_product_id);
CREATE INDEX idx_variants_sku ON variants(sku);

-- -----------------------------------------------------------------------------
-- Orders
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  status order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_campaign_id ON orders(campaign_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- -----------------------------------------------------------------------------
-- Order Items
-- -----------------------------------------------------------------------------
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE RESTRICT,
  customization_value TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_products_updated_at BEFORE UPDATE ON campaign_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    new_number := 'SQ' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
      done := TRUE;
    END IF;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Stores Policies
-- -----------------------------------------------------------------------------

-- Store owners can do everything with their stores
CREATE POLICY "Store owners can view their stores"
  ON stores FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Store owners can update their stores"
  ON stores FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Store owners can delete their stores"
  ON stores FOR DELETE
  USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Public can view stores by slug (for storefront)
CREATE POLICY "Public can view stores by slug"
  ON stores FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- Campaigns Policies
-- -----------------------------------------------------------------------------

-- Campaign access based on store ownership
CREATE POLICY "Store owners can view their campaigns"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores WHERE stores.id = campaigns.store_id AND stores.created_by = auth.uid()
    )
  );

CREATE POLICY "Store owners can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores WHERE stores.id = campaigns.store_id AND stores.created_by = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their campaigns"
  ON campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores WHERE stores.id = campaigns.store_id AND stores.created_by = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their campaigns"
  ON campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores WHERE stores.id = campaigns.store_id AND stores.created_by = auth.uid()
    )
  );

-- Public can view active campaigns (for storefront)
CREATE POLICY "Public can view active campaigns"
  ON campaigns FOR SELECT
  USING (status = 'active');

-- -----------------------------------------------------------------------------
-- Campaign Products Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Store owners can manage products"
  ON campaign_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      JOIN stores ON stores.id = campaigns.store_id
      WHERE campaigns.id = campaign_products.campaign_id
        AND stores.created_by = auth.uid()
    )
  );

CREATE POLICY "Public can view active products"
  ON campaign_products FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_products.campaign_id
        AND campaigns.status = 'active'
    )
  );

-- -----------------------------------------------------------------------------
-- Variants Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Store owners can manage variants"
  ON variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaign_products
      JOIN campaigns ON campaigns.id = campaign_products.campaign_id
      JOIN stores ON stores.id = campaigns.store_id
      WHERE campaign_products.id = variants.campaign_product_id
        AND stores.created_by = auth.uid()
    )
  );

CREATE POLICY "Public can view variants"
  ON variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_products
      JOIN campaigns ON campaigns.id = campaign_products.campaign_id
      WHERE campaign_products.id = variants.campaign_product_id
        AND campaign_products.status = 'active'
        AND campaigns.status = 'active'
    )
  );

-- -----------------------------------------------------------------------------
-- Orders Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Store owners can view their orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      JOIN stores ON stores.id = campaigns.store_id
      WHERE campaigns.id = orders.campaign_id
        AND stores.created_by = auth.uid()
    )
  );

CREATE POLICY "Store owners can update order status"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      JOIN stores ON stores.id = campaigns.store_id
      WHERE campaigns.id = orders.campaign_id
        AND stores.created_by = auth.uid()
    )
  );

-- Service role can create orders (from checkout API)
CREATE POLICY "Service role can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Customers can view their own orders (by email)
CREATE POLICY "Customers can view their orders"
  ON orders FOR SELECT
  USING (customer_email = auth.jwt()->>'email');

-- -----------------------------------------------------------------------------
-- Order Items Policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Store owners can view order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN campaigns ON campaigns.id = orders.campaign_id
      JOIN stores ON stores.id = campaigns.store_id
      WHERE orders.id = order_items.order_id
        AND stores.created_by = auth.uid()
    )
  );

-- Service role can create order items (from checkout API)
CREATE POLICY "Service role can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Customers can view their own order items
CREATE POLICY "Customers can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_email = auth.jwt()->>'email'
    )
  );

-- =============================================================================
-- SEED DATA (Optional - for testing)
-- =============================================================================

-- Uncomment to add test data:
-- INSERT INTO stores (slug, name, contact_email, created_by)
-- VALUES ('test-store', 'Test Store', 'test@example.com', auth.uid());
