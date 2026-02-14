
-- ============================================
-- 1.1 Bookings
-- ============================================
CREATE TABLE public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  guests_count int DEFAULT 1,
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights int GENERATED ALWAYS AS (check_out - check_in) STORED,
  base_price_per_night numeric NOT NULL,
  cleaning_fee numeric DEFAULT 0,
  tourist_tax_total numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  discount_reason text,
  total_price numeric NOT NULL,
  status text DEFAULT 'pending',
  source text DEFAULT 'direct',
  stripe_session_id text,
  stripe_payment_intent text,
  paid_at timestamptz,
  contract_accepted_at timestamptz,
  special_requests text,
  internal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL USING (is_admin());
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 1.2 Booking Contracts
-- ============================================
CREATE TABLE public.booking_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  contract_html text NOT NULL,
  accepted_at timestamptz,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.booking_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage contracts" ON public.booking_contracts FOR ALL USING (is_admin());
CREATE POLICY "Public can insert contracts" ON public.booking_contracts FOR INSERT WITH CHECK (true);

-- ============================================
-- 1.3 Contract Templates
-- ============================================
CREATE TABLE public.contract_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id),
  title text NOT NULL DEFAULT 'Contrat de location saisonnière',
  body_html text NOT NULL DEFAULT '<p>Contract template — edit in admin</p>',
  language text DEFAULT 'fr',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active templates" ON public.contract_templates FOR SELECT USING (active = true);
CREATE POLICY "Admins manage templates" ON public.contract_templates FOR ALL USING (is_admin());

-- ============================================
-- 1.4 Availability
-- ============================================
CREATE TABLE public.availability (
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  available boolean DEFAULT true,
  price_override numeric,
  min_nights_override int,
  source text DEFAULT 'manual',
  airbnb_uid text,
  booking_id uuid REFERENCES public.bookings(id),
  PRIMARY KEY (property_id, date)
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Admins manage availability" ON public.availability FOR ALL USING (is_admin());

-- ============================================
-- 1.5 Seasonal Pricing
-- ============================================
CREATE TABLE public.seasonal_pricing (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  price_per_night numeric NOT NULL,
  min_nights int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.seasonal_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read pricing" ON public.seasonal_pricing FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing" ON public.seasonal_pricing FOR ALL USING (is_admin());

-- ============================================
-- 1.6 Promo Codes
-- ============================================
CREATE TABLE public.promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_percent numeric,
  discount_amount numeric,
  valid_from date,
  valid_until date,
  max_uses int,
  current_uses int DEFAULT 0,
  property_id uuid REFERENCES public.properties(id),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage promos" ON public.promo_codes FOR ALL USING (is_admin());

-- ============================================
-- 1.7 Inquiries
-- ============================================
CREATE TABLE public.inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text,
  type text DEFAULT 'general',
  property_id uuid REFERENCES public.properties(id),
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage inquiries" ON public.inquiries FOR ALL USING (is_admin());

-- ============================================
-- 1.8 Site Content (CMS)
-- ============================================
CREATE TABLE public.site_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page text NOT NULL,
  section text NOT NULL,
  content_fr text,
  content_en text,
  content_type text DEFAULT 'text',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins manage content" ON public.site_content FOR ALL USING (is_admin());

-- ============================================
-- 1.9 iCal Sync Log
-- ============================================
CREATE TABLE public.ical_sync_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  synced_at timestamptz DEFAULT now(),
  events_found int DEFAULT 0,
  events_created int DEFAULT 0,
  events_updated int DEFAULT 0,
  status text,
  error_message text
);

ALTER TABLE public.ical_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read sync logs" ON public.ical_sync_log FOR ALL USING (is_admin());

-- ============================================
-- 1.10 Price Suggestions
-- ============================================
CREATE TABLE public.price_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  date date NOT NULL,
  current_price numeric NOT NULL,
  suggested_price numeric NOT NULL,
  reason text,
  occupancy_rate numeric,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.price_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage suggestions" ON public.price_suggestions FOR ALL USING (is_admin());

-- ============================================
-- 1.11 Payment Settings
-- ============================================
CREATE TABLE public.payment_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_publishable_key text,
  methods_enabled jsonb DEFAULT '{"card":true,"apple_pay":false,"google_pay":false}'::jsonb,
  currency text DEFAULT 'EUR',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payment settings" ON public.payment_settings FOR ALL USING (is_admin());

-- ============================================
-- 1.12 Alter properties table
-- ============================================
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS cleaning_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tourist_tax_per_person numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekend_price numeric,
  ADD COLUMN IF NOT EXISTS min_nights int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS airbnb_ical_url text,
  ADD COLUMN IF NOT EXISTS ical_export_token text DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS house_rules jsonb DEFAULT '[]'::jsonb;
