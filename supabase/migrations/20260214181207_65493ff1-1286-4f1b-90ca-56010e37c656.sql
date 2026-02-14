
CREATE TABLE public.property_pois (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  label text NOT NULL,
  emoji text DEFAULT '📍',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.property_pois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read POIs" ON public.property_pois FOR SELECT USING (true);
CREATE POLICY "Admins can insert POIs" ON public.property_pois FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update POIs" ON public.property_pois FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete POIs" ON public.property_pois FOR DELETE USING (is_admin());
