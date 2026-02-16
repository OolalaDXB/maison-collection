
-- Add is_recurring column to seasonal_pricing
ALTER TABLE public.seasonal_pricing 
  ADD COLUMN is_recurring boolean DEFAULT false;

-- Create overlap prevention trigger
CREATE OR REPLACE FUNCTION public.check_seasonal_pricing_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.seasonal_pricing
    WHERE property_id = NEW.property_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.start_date >= start_date AND NEW.start_date <= end_date)
        OR (NEW.end_date >= start_date AND NEW.end_date <= end_date)
        OR (NEW.start_date <= start_date AND NEW.end_date >= end_date)
      )
  ) THEN
    RAISE EXCEPTION 'Seasonal pricing dates overlap with existing season';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER prevent_seasonal_pricing_overlap
  BEFORE INSERT OR UPDATE ON public.seasonal_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.check_seasonal_pricing_overlap();
