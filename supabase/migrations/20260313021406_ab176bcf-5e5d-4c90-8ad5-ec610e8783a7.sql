CREATE POLICY "Authenticated can view any salon by slug"
ON public.salons
FOR SELECT
TO authenticated
USING (true);