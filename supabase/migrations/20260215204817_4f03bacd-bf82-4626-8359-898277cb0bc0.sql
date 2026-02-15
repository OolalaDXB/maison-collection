
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  
  entry_type text NOT NULL CHECK (entry_type IN ('income', 'expense')),
  category text NOT NULL,
  subcategory text,
  
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  amount_eur numeric(12,2),
  fx_rate numeric(10,6),
  
  description text NOT NULL,
  reference text,
  counterparty text,
  
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'airbnb_csv', 'airbnb_sync', 'auto', 'bank')),
  receipt_url text,
  
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ledger" ON public.ledger_entries FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX idx_ledger_property_date ON public.ledger_entries(property_id, entry_date);
CREATE INDEX idx_ledger_booking ON public.ledger_entries(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_ledger_category ON public.ledger_entries(category, entry_type);
