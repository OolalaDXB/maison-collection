
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Helper function: check admin role (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Convenience function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 5. RLS on user_roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 6. Properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT,
  price_per_night INTEGER,
  currency TEXT NOT NULL DEFAULT 'EUR',
  capacity INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm INTEGER,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  airbnb_link TEXT,
  airbnb_rating NUMERIC(2,1),
  airbnb_reviews_count INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'coming_soon')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  hero_image TEXT,
  architect_name TEXT,
  architect_location TEXT,
  architect_year INTEGER,
  architect_links JSONB DEFAULT '[]',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 7. Property images table
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- 8. RLS policies for properties
CREATE POLICY "Anyone can read properties"
  ON public.properties FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert properties"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update properties"
  ON public.properties FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete properties"
  ON public.properties FOR DELETE TO authenticated
  USING (public.is_admin());

-- 9. RLS policies for property_images
CREATE POLICY "Anyone can read property images"
  ON public.property_images FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert images"
  ON public.property_images FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update images"
  ON public.property_images FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete images"
  ON public.property_images FOR DELETE TO authenticated
  USING (public.is_admin());

-- 10. Storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND public.is_admin());

CREATE POLICY "Admins can update property images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin());

CREATE POLICY "Admins can delete property images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin());

-- 11. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
