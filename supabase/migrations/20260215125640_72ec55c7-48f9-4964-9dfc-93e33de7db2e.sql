
-- 1. Property services table
CREATE TABLE IF NOT EXISTS public.property_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('included', 'a_la_carte')),
  label text NOT NULL,
  description text,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.property_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read services" ON public.property_services FOR SELECT USING (true);
CREATE POLICY "Admins manage services" ON public.property_services FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Seed Georgia included services
INSERT INTO public.property_services (property_id, category, label, display_order)
SELECT p.id, 'included', s.label, s.ord
FROM public.properties p,
(VALUES
  ('Fresh linen and towels', 1),
  ('Wood-burning fireplace (unlimited wood supply)', 2),
  ('Fully equipped kitchen', 3),
  ('Fast WiFi & Smart TV', 4),
  ('Self check-in 24/7 via secure lockbox', 5),
  ('Ski lockers in basement', 6),
  ('Free parking in front of building', 7),
  ('Dedicated contact throughout your stay', 8),
  ('Balcony with mountain views', 9),
  ('Washing machine', 10)
) AS s(label, ord)
WHERE p.slug = 'georgia';

-- Seed Georgia a la carte
INSERT INTO public.property_services (property_id, category, label, display_order)
SELECT p.id, 'a_la_carte', s.label, s.ord
FROM public.properties p,
(VALUES
  ('Airport transfer (Tbilisi, 2h)', 1),
  ('Ski rental delivery', 2),
  ('Private ski instructor', 3),
  ('Grocery delivery', 4),
  ('Georgian wine tasting', 5),
  ('Paragliding', 6),
  ('Mountain guide & hiking', 7),
  ('Chef at home (Georgian cuisine)', 8)
) AS s(label, ord)
WHERE p.slug = 'georgia';

-- Seed Atlantique included services
INSERT INTO public.property_services (property_id, category, label, display_order)
SELECT p.id, 'included', s.label, s.ord
FROM public.properties p,
(VALUES
  ('Fresh linen, towels & cotton bed linens', 1),
  ('Welcome basket with local products & coffee', 2),
  ('Heated pool 12×6m under enclosure (late April–September)', 3),
  ('Garden furniture, hammock & sun loungers', 4),
  ('Self check-in with digital keypad lock', 5),
  ('Dedicated contact throughout your stay', 6),
  ('Washer & dryer', 7),
  ('Dishwasher & fully equipped kitchen', 8),
  ('Pellet stove (pellets provided)', 9),
  ('TV, piano & children''s toys', 10),
  ('Crib available on request', 11),
  ('Zip line, swing, basketball court & football area', 12),
  ('Free private parking (4 spaces)', 13),
  ('Fibre WiFi & dedicated workspace', 14),
  ('Solar panels — eco-friendly initiative', 15)
) AS s(label, ord)
WHERE p.slug = 'atlantique';

-- Seed Atlantique a la carte
INSERT INTO public.property_services (property_id, category, label, display_order)
SELECT p.id, 'a_la_carte', s.label, s.ord
FROM public.properties p,
(VALUES
  ('Private chef', 1),
  ('Grocery delivery', 2),
  ('Babysitter', 3),
  ('Boat excursion', 4),
  ('Guided tours (Gulf of Morbihan)', 5),
  ('Oyster tasting', 6),
  ('Massage at home', 7),
  ('Bike rental', 8)
) AS s(label, ord)
WHERE p.slug = 'atlantique';

-- Seed Arabia included services
INSERT INTO public.property_services (property_id, category, label, display_order)
SELECT p.id, 'included', s.label, s.ord
FROM public.properties p,
(VALUES
  ('Dedicated live-in helper (Imelda)', 1),
  ('Daily housekeeping', 2),
  ('Fresh linen and towels', 3),
  ('Community pool & kids'' pool access', 4),
  ('Fitness center access', 5),
  ('4 km jogging & cycling track', 6),
  ('Tennis court & football pitch', 7),
  ('Equestrian center access', 8),
  ('Children''s books and toys', 9),
  ('Children''s dinnerware', 10),
  ('Fast WiFi & dedicated workspace', 11),
  ('Free parking on premises', 12),
  ('Air conditioning throughout', 13),
  ('Washer & dryer', 14),
  ('Self check-in with keypad', 15)
) AS s(label, ord)
WHERE p.slug = 'arabia';

-- Seed Arabia a la carte
INSERT INTO public.property_services (property_id, category, label, display_order)
SELECT p.id, 'a_la_carte', s.label, s.ord
FROM public.properties p,
(VALUES
  ('Private chef', 1),
  ('Grocery delivery', 2),
  ('Babysitter', 3),
  ('Desert safari', 4),
  ('Private yacht excursion', 5),
  ('City tour with driver', 6),
  ('Spa & wellness', 7),
  ('Airport transfer', 8)
) AS s(label, ord)
WHERE p.slug = 'arabia';

-- 2. Property region content table
CREATE TABLE IF NOT EXISTS public.property_region_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE UNIQUE,
  subtitle text,
  title text NOT NULL,
  tagline text,
  intro_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.property_region_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads region content" ON public.property_region_content FOR SELECT USING (true);
CREATE POLICY "Admins manage region content" ON public.property_region_content FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 3. Property region cards table
CREATE TABLE IF NOT EXISTS public.property_region_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  icon text NOT NULL DEFAULT 'MapPin',
  title text NOT NULL,
  text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.property_region_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads region cards" ON public.property_region_cards FOR SELECT USING (true);
CREATE POLICY "Admins manage region cards" ON public.property_region_cards FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 4. Property region links table
CREATE TABLE IF NOT EXISTS public.property_region_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.property_region_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads region links" ON public.property_region_links FOR SELECT USING (true);
CREATE POLICY "Admins manage region links" ON public.property_region_links FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Seed Georgia region
INSERT INTO public.property_region_content (property_id, subtitle, title, tagline, intro_text)
SELECT id, 'The Region', 'Gudauri & Kazbegi',
  'Where Europe meets Asia, on the roof of the Caucasus.',
  'Gudauri is Georgia''s premier mountain resort, perched on the Greater Caucasus range along the ancient Georgian Military Highway — the route that once connected empires. In winter, it''s one of Europe''s best-kept skiing secrets. In summer, it transforms into a base for hiking, paragliding, and exploring one of the world''s most dramatic landscapes.

Just 90 minutes north lies Kazbegi (Stepantsminda), a village at the foot of Mount Kazbek (5,047m) and the legendary Gergeti Trinity Church. The drive there — through the Jvari Pass at 2,379m — is unforgettable. Tbilisi, Georgia''s vibrant capital, is 2 hours south.'
FROM public.properties WHERE slug = 'georgia';

INSERT INTO public.property_region_cards (property_id, icon, title, text, display_order)
SELECT p.id, c.icon, c.title, c.text, c.ord
FROM public.properties p,
(VALUES
  ('Mountain', 'The Greater Caucasus', 'Gudauri sits at 2,200m on the southern slopes of the Greater Caucasus, one of Europe''s last wild mountain ranges. Peaks above 4,000m, deep gorges, and alpine meadows.', 1),
  ('Snowflake', 'Year-Round Adventure', 'Winter: 57km of pistes, off-piste freeride, heliskiing. Summer: paragliding, hiking the Caucasus Trail, mountain biking. Gudauri has 300 days of sunshine a year.', 2),
  ('Church', 'Kazbegi & Beyond', 'The iconic Gergeti Trinity Church (2,170m) and Mount Kazbek (5,047m) are 1h30 north. The Georgian Military Highway is one of the world''s most scenic drives.', 3)
) AS c(icon, title, text, ord)
WHERE p.slug = 'georgia';

INSERT INTO public.property_region_links (property_id, label, url, display_order)
SELECT p.id, l.label, l.url, l.ord
FROM public.properties p,
(VALUES
  ('Visit Georgia', 'https://www.georgia.travel/', 1),
  ('Gudauri Ski Resort', 'https://gudauri.info/', 2),
  ('Kazbegi National Park', 'https://www.georgia.travel/destinations/kazbegi', 3)
) AS l(label, url, ord)
WHERE p.slug = 'georgia';

-- Seed Atlantique region
INSERT INTO public.property_region_content (property_id, subtitle, title, tagline, intro_text)
SELECT id, 'The Region', 'Quistinic & the Morbihan',
  'Deep Brittany — where the land meets the Atlantic.',
  'Maison Atlantique sits outside the village of Quistinic, in the Morbihan department of Brittany. This is inland Brittany at its purest — rolling countryside, ancient stone walls, oak forests, and a stillness you won''t find on the coast. The Blavet river valley runs nearby, offering kayaking, cycling, and long walks through unspoiled nature. The Morbihan is a paradise for hikers — from gentle paths along the Blavet to the legendary GR34 coastal trail. Nearby, the association Les Vieilles Pierres maintains a beautiful network of heritage walking routes through ancient stone villages and woodland.

But the coast is never far. The Gulf of Morbihan — one of the most beautiful bays in the world — is 30 minutes south. The wild beaches of the Quiberon peninsula, the standing stones of Carnac (the largest megalithic site in Europe), and the islands of Belle-Île and Houat are all within easy reach.'
FROM public.properties WHERE slug = 'atlantique';

INSERT INTO public.property_region_cards (property_id, icon, title, text, display_order)
SELECT p.id, c.icon, c.title, c.text, c.ord
FROM public.properties p,
(VALUES
  ('TreePine', 'Deep Brittany', 'Quistinic sits in the heart of the Morbihan, surrounded by bocage countryside, ancient forests, and the Blavet river valley. Absolute tranquility, 30 minutes from the coast.', 1),
  ('Waves', 'The Morbihan Coast', 'The Gulf of Morbihan, Quiberon peninsula, Belle-Île, Carnac''s megaliths — all within an hour. Some of Brittany''s most beautiful beaches are 30 minutes away.', 2),
  ('Landmark', 'Heritage & Culture', 'The medieval village of Poul Fétan (5 min), the historic city of Vannes, Lorient''s maritime heritage, and the standing stones of Carnac — 5,000 years of history.', 3),
  ('Footprints', 'Hiking & Walking Trails', 'The Morbihan is crossed by hundreds of kilometers of marked trails — along the Blavet valley, through bocage countryside, and along the coastal GR34. From gentle village walks to full-day hikes along the megalithic alignments of Carnac.', 4)
) AS c(icon, title, text, ord)
WHERE p.slug = 'atlantique';

INSERT INTO public.property_region_links (property_id, label, url, display_order)
SELECT p.id, l.label, l.url, l.ord
FROM public.properties p,
(VALUES
  ('Morbihan Tourisme', 'https://www.morbihan.com/', 1),
  ('Golfe du Morbihan', 'https://www.golfedumorbihan.bzh/', 2),
  ('Poul Fétan', 'https://www.poulfetan.com/', 3),
  ('Les Vieilles Pierres — Randonnées', 'https://www.lesvieillespierres.com/', 4)
) AS l(label, url, ord)
WHERE p.slug = 'atlantique';

-- Seed Arabia region
INSERT INTO public.property_region_content (property_id, subtitle, title, tagline, intro_text)
SELECT id, 'The Community', 'The Sustainable City',
  'The first net-zero energy community in the Middle East.',
  'Built by Diamond Developers in 2015, this 113-acre community of 500 homes was designed around one idea: prove that sustainable living doesn''t mean sacrifice. Car-free streets, solar-powered homes, urban farms, a 30-metre tree belt, and a community where neighbours actually know each other.

Awarded "Happiest Community" by the Gulf Real Estate Awards and recognised by the SEE Institute as a model for sustainable urban development. Over 60% of the city is dedicated to green spaces. 8,000+ tons of CO₂ avoided annually.'
FROM public.properties WHERE slug = 'arabia';

INSERT INTO public.property_region_cards (property_id, icon, title, text, display_order)
SELECT p.id, c.icon, c.title, c.text, c.ord
FROM public.properties p,
(VALUES
  ('Leaf', 'Net-Zero Energy', 'Solar panels generate as much energy as the community consumes. Average water use: 162L/capita vs Dubai''s 278L.', 1),
  ('Baby', 'Family-First Design', 'Car-free residential streets. 4 playgrounds, equestrian center, farm with animals. Children run free.', 2),
  ('TreePine', 'Living Green', '11 bio-dome greenhouses, urban farms, 10,000 trees. Residents grow their own produce.', 3)
) AS c(icon, title, text, ord)
WHERE p.slug = 'arabia';

INSERT INTO public.property_region_links (property_id, label, url, display_order)
SELECT p.id, l.label, l.url, l.ord
FROM public.properties p,
(VALUES
  ('The Sustainable City', 'https://thesustainablecity.com/cities/dubai/', 1),
  ('Instagram', 'https://www.instagram.com/thesustainablecity', 2),
  ('SEE Institute', 'https://www.seeinstitute.ae/', 3)
) AS l(label, url, ord)
WHERE p.slug = 'arabia';
