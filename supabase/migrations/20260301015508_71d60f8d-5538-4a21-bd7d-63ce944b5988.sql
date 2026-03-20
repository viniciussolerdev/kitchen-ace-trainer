-- Allow anon to check if a client phone exists (for public booking dedup)
CREATE POLICY "Anon can view clients by phone for booking"
ON public.clients
FOR SELECT
USING (true);