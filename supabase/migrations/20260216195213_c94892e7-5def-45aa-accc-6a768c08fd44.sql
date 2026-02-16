-- Add airbnb_reference_code column to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS airbnb_reference_code text;

-- Create index for duplicate detection on reference code
CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_reference ON bookings(airbnb_reference_code);

-- Ensure index exists on confirmation code too
CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_confirmation ON bookings(airbnb_confirmation_code);