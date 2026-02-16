-- Allow concierges to read bookings
CREATE POLICY "Concierges can read bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'concierge'));

-- Allow concierges to read availability
CREATE POLICY "Concierges can read availability"
ON public.availability
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'concierge'));