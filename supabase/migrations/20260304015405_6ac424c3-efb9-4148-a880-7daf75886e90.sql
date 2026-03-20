CREATE POLICY "Anon can update client email for booking"
ON public.clients
FOR UPDATE
USING (true)
WITH CHECK (true);