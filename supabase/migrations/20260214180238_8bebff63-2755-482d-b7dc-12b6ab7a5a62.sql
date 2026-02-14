
-- Add check-in/check-out/parking to properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS check_in_time text DEFAULT '15:00',
ADD COLUMN IF NOT EXISTS check_out_time text DEFAULT '11:00',
ADD COLUMN IF NOT EXISTS parking_info text DEFAULT 'Free parking in front of building (non-reserved)',
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_location text,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  stay_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Admins can insert reviews" ON public.reviews
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update reviews" ON public.reviews
FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete reviews" ON public.reviews
FOR DELETE USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
