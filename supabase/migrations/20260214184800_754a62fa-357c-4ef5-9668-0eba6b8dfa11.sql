
CREATE TABLE public.fx_rates (
  base_currency text DEFAULT 'EUR',
  target_currency text NOT NULL,
  rate numeric NOT NULL,
  fetched_at timestamptz DEFAULT now(),
  PRIMARY KEY (base_currency, target_currency)
);

ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read rates" ON public.fx_rates FOR SELECT USING (true);
CREATE POLICY "Admins manage rates" ON public.fx_rates FOR ALL USING (is_admin());
