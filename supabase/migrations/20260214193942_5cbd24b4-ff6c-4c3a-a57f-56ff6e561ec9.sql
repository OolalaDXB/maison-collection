-- Insert Georgia property
INSERT INTO public.properties (name, slug, location, region, country, description, long_description, price_per_night, currency, capacity, bedrooms, bathrooms, area_sqm, amenities, airbnb_link, airbnb_rating, airbnb_reviews_count, status, tags, display_order, check_in_time, check_out_time, parking_info, latitude, longitude)
VALUES (
  'Maison Georgia',
  'georgia',
  'Gudauri, Caucasus',
  'Greater Caucasus',
  'Georgia',
  'Mountain duplex at the crossroads of Europe and Asia. Double-height windows framing the Caucasus. Fireplace, panoramic views, 200m from the gondola.',
  'Ski duplex 100m² at 200m from the gondola in New Gudauri. Two levels, two private bedrooms, sleeps 6, three bathrooms. Wood fireplace with unlimited supply, equipped kitchen, panoramic Caucasus views, balcony, fast WiFi and Smart TV.

Level 1: Open studio with sofa bed, kitchen, fireplace, bathroom with tub. Level 2: Bedroom with queen bed, second bedroom with two singles, two private bathrooms.

Why guests love it: Optimal ski location — literally 4 minutes walk to the gondola. Panoramic double-height bay windows with sunrise over the peaks. Guaranteed comfort even at −15°C. Three bathrooms means zero morning wait. Self check-in 24/7 via secure lockbox. Ski lockers in basement, rental shop 50m away. SPA in basement available for a fee. Free parking in front of building.',
  180,
  'EUR',
  6, 2, 3, 100,
  ARRAY['Fireplace (unlimited wood)','Hi-Fi system','Ski storage (basement lockers)','Panoramic balcony','200m from gondola','Starlink WiFi','Smart TV','Equipped kitchen','SPA (basement, fee)','Free parking','Self check-in 24/7','Washer','Elevator'],
  'https://www.airbnb.com/h/gudaurichalet',
  5.0, 20,
  'active',
  ARRAY['Ski Season','Superhost','Guest Favourite'],
  0,
  '15:00', '11:00',
  'Free parking in front of building (non-reserved)',
  42.4614, 44.4731
);

-- Insert Atlantique property
INSERT INTO public.properties (name, slug, location, region, country, description, long_description, price_per_night, currency, capacity, bedrooms, bathrooms, area_sqm, amenities, airbnb_link, airbnb_rating, airbnb_reviews_count, status, tags, display_order, check_in_time, check_out_time, architect_name, architect_location, architect_year, architect_links, latitude, longitude)
VALUES (
  'Maison Atlantique',
  'atlantique',
  'Quistinic, Morbihan',
  'Brittany',
  'France',
  '19th century Breton penty reimagined by Anthropie Architecture. Stone, contemporary extension, covered heated pool. Bocage silence, 20 minutes from the coast.',
  'A 19th century Breton penty, meticulously reimagined by Anthropie Architecture in 2023. The original stone structure meets a bold contemporary extension, creating 120m² of refined living space plus a 20m² covered terrace. The heated pool is sheltered beneath an elegant covering, extending the swimming season from April through September. Set in the peaceful bocage countryside of Morbihan, the property offers complete serenity just 20 minutes from the Atlantic coast.',
  250,
  'EUR',
  6, 2, 2, 120,
  ARRAY['Heated pool','Covered terrace (20m²)','Contemporary architecture','Stone construction','Bocage countryside','20 min from coast'],
  'https://www.airbnb.com/l/LEHC2J81',
  5.0, NULL,
  'active',
  ARRAY['Architecture 2023','Pool'],
  1,
  '16:00', '10:00',
  'Anthropie Architecture',
  'Vannes',
  2023,
  '[{"label":"Anthropie Studio","url":"https://anthropie-studio.com/architecture-s/maison-du-helleguy/"},{"label":"Archibien","url":"https://www.archibien.com/project/france/quistinic/le-helleguy/"},{"label":"Houzz","url":"https://www.houzz.fr/professionnels/architecte/anthropie-architectures-pfvwfr-pf~599273598"}]'::jsonb,
  47.9167, -3.1333
);

-- Insert Arabia (coming soon)
INSERT INTO public.properties (name, slug, location, region, country, description, price_per_night, currency, capacity, bedrooms, bathrooms, area_sqm, amenities, status, tags, display_order)
VALUES (
  'Maison Arabia',
  'arabia',
  'Dubai',
  'Gulf',
  'UAE',
  'Coming soon. Our next chapter unfolds in the Gulf.',
  NULL, 'EUR', NULL, NULL, NULL, NULL,
  ARRAY[]::text[],
  'coming_soon',
  ARRAY['Opening 2026'],
  2
);

-- Insert reviews for Georgia
DO $$
DECLARE
  georgia_id uuid;
BEGIN
  SELECT id INTO georgia_id FROM public.properties WHERE slug = 'georgia';

  INSERT INTO public.reviews (property_id, guest_name, guest_location, rating, review_text, stay_date) VALUES
    (georgia_id, 'Anastasia', 'Tbilisi', 5, 'I had a wonderful stay! The place was very clean, comfortable, and exactly as described. Special thanks to Darya for being such a kind and responsive host. I would definitely stay here again!', '2025-08-15'),
    (georgia_id, 'Marcos Simon', NULL, 5, 'Great and luxurious apartment, 3 min walking from the lifts. Very comfortable and even featuring a beautiful Hi-Fi system. Will probably book again when returning to Gudauri!', '2026-02-01'),
    (georgia_id, 'Abdulaziz', 'Riyadh', 5, 'The place is absolutely fantastic — cozy, comfortable, and perfect. The stunning sunrise views from the balcony were unforgettable. Darya was incredibly friendly and accommodating. Everything about our stay was perfect!', '2025-09-15'),
    (georgia_id, 'Maria', 'Dubai', 5, 'We had a fantastic stay at this ski loft in Gudauri. The apartment is in a great location, very close to the slopes, and is well-equipped and comfortable. Darya was very helpful and responsive. Highly recommended!', '2025-03-10'),
    (georgia_id, 'Wayne', 'Ar-Rayyan, Qatar', 5, 'Darya''s apartment is perfect for a trip with family or friends to Gudauri. Extremely helpful host who went above and beyond. Little touches like the blackout blinds were well thought out without ruining the gorgeous views. We will definitely be back!', '2025-03-15'),
    (georgia_id, 'Piotr', NULL, 5, 'The apartment feels welcoming, nicely designed, and very spacious — perfect for a family of 5–6 people. The kitchen is large and well equipped, and having a private bathroom for each bedroom is a huge plus. Overall, a great apartment that we highly recommend for families.', '2026-02-01'),
    (georgia_id, 'Adrianne', 'Chapel Hill, NC', 5, 'Fantastic stay in Gudauri at the loft. Great location and superb views.', '2025-12-15'),
    (georgia_id, 'Abdull', 'Kuwait City', 5, 'A wonderful place in New Gudauri for ski in/ski out. The apartment is a stunner. The host was incredibly helpful with airport transport, restaurant recommendations and more. For a ski holiday… this place is tops!', '2025-02-10'),
    (georgia_id, 'Daniel', 'Israel', 5, 'Everything worked perfectly. A loft with a perfect layout for 2 families. Very beautiful view from the window, gorgeous fireplace, 2 excellent bedrooms with their own bathrooms. Perfectly located with restaurants, supermarkets and lift nearby.', '2026-01-20'),
    (georgia_id, 'Irina', NULL, 5, 'This place is absolutely amazing! The location is perfect, offering stunning views and being just steps away from the cable car and ski rentals. Darya and Mickael were wonderful hosts, always responsive and accommodating. Highly recommend!', '2025-02-15'),
    (georgia_id, 'Kevin', 'Dubai', 5, 'The highlight of this loft is of course the fireplace! Lighting a fireplace on a cold snowy evening was just great! Communication with the hosts is fast and hassle-free. Conveniently located almost in the center of the ski resort.', '2025-12-20'),
    (georgia_id, 'Artem', 'Almaty', 5, 'Darya''s place was absolutely amazing and we had a very relaxing weekend with our friends! It''s a walking distance to ski lifts and bars. The house is well equipped with everything we needed. Darya is a great host!', '2025-01-20');
END $$;

-- Seed FX rates
INSERT INTO public.fx_rates (base_currency, target_currency, rate) VALUES
  ('EUR', 'USD', 1.08),
  ('EUR', 'GBP', 0.86),
  ('EUR', 'AED', 3.97),
  ('EUR', 'GEL', 2.95)
ON CONFLICT (base_currency, target_currency) DO UPDATE SET rate = EXCLUDED.rate, fetched_at = now();