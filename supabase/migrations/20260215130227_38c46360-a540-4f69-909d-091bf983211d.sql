-- Add Airbnb-specific columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS airbnb_confirmation_code text,
  ADD COLUMN IF NOT EXISTS airbnb_payout numeric,
  ADD COLUMN IF NOT EXISTS airbnb_service_fee numeric;

-- Index for CSV deduplication
CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_code
  ON public.bookings (airbnb_confirmation_code)
  WHERE airbnb_confirmation_code IS NOT NULL;

-- Index for iCal deduplication by source + dates
CREATE INDEX IF NOT EXISTS idx_bookings_source_dates
  ON public.bookings (property_id, source, check_in, check_out);