
-- Add missing columns to bookings table for Airbnb reservation CSV import
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS num_adults integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS num_children integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS num_infants integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booked_date date,
  ADD COLUMN IF NOT EXISTS airbnb_status text,
  ADD COLUMN IF NOT EXISTS guest_address text,
  ADD COLUMN IF NOT EXISTS guest_city text,
  ADD COLUMN IF NOT EXISTS guest_country text;

-- Add index on airbnb_confirmation_code for fast duplicate detection
CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_confirmation 
  ON public.bookings(airbnb_confirmation_code);
