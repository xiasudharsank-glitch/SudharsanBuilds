-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  deposit_paid DECIMAL(10, 2) NOT NULL,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'partially_paid', 'paid')),
  payment_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  project_details TEXT,
  timeline TEXT,
  invoice_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on invoice_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_id ON public.invoices(invoice_id);

-- Create index on customer_email for customer queries
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON public.invoices(customer_email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- (You can modify this based on your security requirements)
CREATE POLICY "Allow all operations for service role" ON public.invoices
  FOR ALL
  USING (true);

-- Create policy to allow customers to view their own invoices
CREATE POLICY "Allow customers to view their own invoices" ON public.invoices
  FOR SELECT
  USING (auth.jwt() ->> 'email' = customer_email);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.invoices IS 'Stores invoice details for website development bookings';
