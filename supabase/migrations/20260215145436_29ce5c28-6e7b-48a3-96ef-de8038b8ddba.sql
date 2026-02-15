CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_code
  ON public.bookings (airbnb_confirmation_code)
  WHERE airbnb_confirmation_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_source_dates
  ON public.bookings (property_id, source, check_in, check_out);