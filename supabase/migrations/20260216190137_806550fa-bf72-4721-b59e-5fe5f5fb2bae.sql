
-- Atomic booking function: checks availability, creates booking, blocks dates in one transaction
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_property_id uuid,
  p_check_in date,
  p_check_out date,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text DEFAULT NULL,
  p_guests_count integer DEFAULT 1,
  p_base_price_per_night numeric DEFAULT 0,
  p_cleaning_fee numeric DEFAULT 0,
  p_tourist_tax_total numeric DEFAULT 0,
  p_total_price numeric DEFAULT 0,
  p_special_requests text DEFAULT NULL,
  p_payment_method text DEFAULT 'card',
  p_contract_html text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id uuid;
  v_date date;
  v_blocked_count integer;
BEGIN
  -- 1. Lock and check availability atomically
  SELECT count(*) INTO v_blocked_count
  FROM availability
  WHERE property_id = p_property_id
    AND date >= p_check_in
    AND date < p_check_out
    AND available = false
  FOR UPDATE;

  IF v_blocked_count > 0 THEN
    RAISE EXCEPTION 'DATES_UNAVAILABLE: % date(s) already blocked', v_blocked_count;
  END IF;

  -- 2. Create booking
  INSERT INTO bookings (
    property_id, guest_name, guest_email, guest_phone, guests_count,
    check_in, check_out, base_price_per_night, cleaning_fee,
    tourist_tax_total, total_price, status, source,
    special_requests, payment_method, payment_status
  ) VALUES (
    p_property_id, p_guest_name, p_guest_email, p_guest_phone, p_guests_count,
    p_check_in, p_check_out, p_base_price_per_night, p_cleaning_fee,
    p_tourist_tax_total, p_total_price, 'pending', 'direct',
    p_special_requests, p_payment_method, 'pending'
  ) RETURNING id INTO v_booking_id;

  -- 3. Block all dates atomically
  FOR v_date IN SELECT generate_series(p_check_in, p_check_out - interval '1 day', '1 day'::interval)::date
  LOOP
    INSERT INTO availability (property_id, date, available, source, booking_id)
    VALUES (p_property_id, v_date, false, 'booking', v_booking_id)
    ON CONFLICT (property_id, date) DO UPDATE
    SET available = false, source = 'booking', booking_id = v_booking_id
    WHERE availability.available = true;
    
    -- Verify the update actually happened (date wasn't already blocked)
    IF NOT FOUND THEN
      RAISE EXCEPTION 'DATES_UNAVAILABLE: date % was blocked by another booking', v_date;
    END IF;
  END LOOP;

  -- 4. Insert contract if provided
  IF p_contract_html IS NOT NULL AND p_contract_html != '' THEN
    INSERT INTO booking_contracts (booking_id, contract_html, accepted_at)
    VALUES (v_booking_id, p_contract_html, now());
  END IF;

  RETURN v_booking_id;
END;
$$;
