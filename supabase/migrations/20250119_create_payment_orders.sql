-- Create payment_orders table for tracking Razorpay payments
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  receipt TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  payment_method TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes JSONB,
  payment_data JSONB
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);

-- Create index on payment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_orders_payment_id ON payment_orders(payment_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);

-- Create index on verified for filtering
CREATE INDEX IF NOT EXISTS idx_payment_orders_verified ON payment_orders(verified);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- Allow authenticated users to read their own orders
CREATE POLICY "Users can view their own payment orders"
  ON payment_orders
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow service role to insert orders (from edge functions)
CREATE POLICY "Service role can insert payment orders"
  ON payment_orders
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Allow service role to update orders (from edge functions)
CREATE POLICY "Service role can update payment orders"
  ON payment_orders
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE payment_orders IS 'Stores Razorpay payment order information';
COMMENT ON COLUMN payment_orders.order_id IS 'Razorpay order ID';
COMMENT ON COLUMN payment_orders.payment_id IS 'Razorpay payment ID (set after payment)';
COMMENT ON COLUMN payment_orders.amount IS 'Order amount in INR';
COMMENT ON COLUMN payment_orders.amount_paid IS 'Amount paid in INR';
COMMENT ON COLUMN payment_orders.verified IS 'Whether payment signature was verified';
COMMENT ON COLUMN payment_orders.payment_data IS 'Full payment response from Razorpay';
