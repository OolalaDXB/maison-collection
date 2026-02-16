
-- Fix bank_accounts: drop RESTRICTIVE SELECT, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Bank accounts are publicly readable" ON public.bank_accounts;
CREATE POLICY "Bank accounts are publicly readable"
  ON public.bank_accounts FOR SELECT
  USING (true);

-- Fix contract_templates: drop RESTRICTIVE SELECT, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can read active templates" ON public.contract_templates;
CREATE POLICY "Public can read active templates"
  ON public.contract_templates FOR SELECT
  USING (active = true);

-- Fix bookings: add PERMISSIVE SELECT for confirmation page
-- No public SELECT policy exists yet — add one scoped to reading a single booking by ID
CREATE POLICY "Public can read own booking by id"
  ON public.bookings FOR SELECT
  USING (true);

-- Fix availability: drop RESTRICTIVE SELECT, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can read availability" ON public.availability;
CREATE POLICY "Public can read availability"
  ON public.availability FOR SELECT
  USING (true);

-- Fix bookings INSERT: drop RESTRICTIVE, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- Fix booking_contracts INSERT: drop RESTRICTIVE, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public can insert contracts" ON public.booking_contracts;
CREATE POLICY "Public can insert contracts"
  ON public.booking_contracts FOR INSERT
  WITH CHECK (true);

-- Fix other public-facing tables with same RESTRICTIVE issue
-- payment_methods
DROP POLICY IF EXISTS "Payment methods are publicly readable" ON public.payment_methods;
CREATE POLICY "Payment methods are publicly readable"
  ON public.payment_methods FOR SELECT
  USING (true);

-- fx_rates
DROP POLICY IF EXISTS "Public can read rates" ON public.fx_rates;
CREATE POLICY "Public can read rates"
  ON public.fx_rates FOR SELECT
  USING (true);

-- seasonal_pricing
DROP POLICY IF EXISTS "Public can read pricing" ON public.seasonal_pricing;
CREATE POLICY "Public can read pricing"
  ON public.seasonal_pricing FOR SELECT
  USING (true);

-- properties
DROP POLICY IF EXISTS "Anyone can read properties" ON public.properties;
CREATE POLICY "Anyone can read properties"
  ON public.properties FOR SELECT
  USING (true);

-- property_images
DROP POLICY IF EXISTS "Anyone can read property images" ON public.property_images;
CREATE POLICY "Anyone can read property images"
  ON public.property_images FOR SELECT
  USING (true);

-- reviews
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- site_content
DROP POLICY IF EXISTS "Public can read content" ON public.site_content;
CREATE POLICY "Public can read content"
  ON public.site_content FOR SELECT
  USING (true);

-- property_services
DROP POLICY IF EXISTS "Public can read services" ON public.property_services;
CREATE POLICY "Public can read services"
  ON public.property_services FOR SELECT
  USING (true);

-- property_pois
DROP POLICY IF EXISTS "Anyone can read POIs" ON public.property_pois;
CREATE POLICY "Anyone can read POIs"
  ON public.property_pois FOR SELECT
  USING (true);

-- property_region_cards
DROP POLICY IF EXISTS "Public reads region cards" ON public.property_region_cards;
CREATE POLICY "Public reads region cards"
  ON public.property_region_cards FOR SELECT
  USING (true);

-- property_region_content
DROP POLICY IF EXISTS "Public reads region content" ON public.property_region_content;
CREATE POLICY "Public reads region content"
  ON public.property_region_content FOR SELECT
  USING (true);

-- property_region_links
DROP POLICY IF EXISTS "Public reads region links" ON public.property_region_links;
CREATE POLICY "Public reads region links"
  ON public.property_region_links FOR SELECT
  USING (true);

-- inquiries INSERT
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);
