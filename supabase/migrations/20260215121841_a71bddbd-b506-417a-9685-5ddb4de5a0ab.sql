
-- 1. Bookings: add payment columns (stripe_session_id already exists)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'card';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- 2. Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  active boolean DEFAULT false,
  config jsonb DEFAULT '{}',
  currencies text[] DEFAULT ARRAY['EUR'],
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment methods are publicly readable" ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY "Only admins can modify payment methods" ON public.payment_methods FOR ALL USING (public.is_admin());

-- Seed payment methods
INSERT INTO public.payment_methods (code, name, description, icon, active, config, currencies, display_order) VALUES
  ('card', 'Credit / Debit Card', 'Visa, Mastercard, Amex — processed securely via Stripe', 'CreditCard', false, '{}', ARRAY['EUR', 'USD'], 1),
  ('bank_transfer', 'Bank Transfer (SEPA / SWIFT)', 'EUR or USD — details provided after confirmation', 'Building2', true, '{}', ARRAY['EUR', 'USD'], 2),
  ('crypto', 'Cryptocurrency (USDC)', 'Stablecoins — wallet address provided after confirmation', 'Bitcoin', false, '{"wallet_address": "", "network": "ethereum"}', ARRAY['EUR', 'USD'], 3);

-- 3. Bank accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name text NOT NULL,
  iban text NOT NULL,
  bic text NOT NULL,
  currency text DEFAULT 'EUR',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bank accounts are publicly readable" ON public.bank_accounts FOR SELECT USING (true);
CREATE POLICY "Only admins can modify bank accounts" ON public.bank_accounts FOR ALL USING (public.is_admin());
