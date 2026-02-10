-- Phase 7: Order Enhancements
-- Add columns for enhanced order tracking

-- Add new columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Notes column already exists in schema, but adding IF NOT EXISTS for safety
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at DESC);
