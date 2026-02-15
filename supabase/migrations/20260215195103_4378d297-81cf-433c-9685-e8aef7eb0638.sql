
-- 1. Delete all "Not available" block bookings (not real reservations)
DELETE FROM bookings 
WHERE source = 'airbnb' 
AND (guest_name ILIKE '%Not available%' OR guest_name ILIKE '%Airbnb (Not%');

-- 2. Deduplicate real airbnb reservations: keep oldest, delete rest
DELETE FROM bookings
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY property_id, check_in, check_out, source 
             ORDER BY created_at ASC
           ) as rn
    FROM bookings
    WHERE source = 'airbnb'
  ) dupes
  WHERE rn > 1
);
