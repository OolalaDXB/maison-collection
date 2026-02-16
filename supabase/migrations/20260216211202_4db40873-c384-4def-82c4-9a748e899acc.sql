-- Add signature_url to booking_contracts
ALTER TABLE public.booking_contracts
ADD COLUMN signature_url text;

-- Create storage bucket for contract signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-signatures', 'contract-signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to upload signatures (needed during booking flow)
CREATE POLICY "Anyone can upload contract signatures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contract-signatures');

-- Allow public to read contract signatures
CREATE POLICY "Contract signatures are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'contract-signatures');

-- Allow admins to delete signatures
CREATE POLICY "Admins can delete contract signatures"
ON storage.objects FOR DELETE
USING (bucket_id = 'contract-signatures' AND (SELECT is_admin()));