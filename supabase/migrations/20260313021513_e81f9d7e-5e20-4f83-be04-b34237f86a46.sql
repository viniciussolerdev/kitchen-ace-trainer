-- Allow authenticated users to view public booking data across all salons
CREATE POLICY "Authenticated can view booking settings"
ON public.public_booking_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can view active services"
ON public.services
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated can view active professionals"
ON public.professionals
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated can view business hours"
ON public.business_hours
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can view appointments for booking"
ON public.appointments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can view clients by phone"
ON public.clients
FOR SELECT
TO authenticated
USING (true);

-- Drop redundant member-only SELECT policies (the new ones are supersets)
DROP POLICY "Members can view booking settings" ON public.public_booking_settings;
DROP POLICY "Members can view salon services" ON public.services;
DROP POLICY "Members can view salon professionals" ON public.professionals;
DROP POLICY "Members can view salon appointments" ON public.appointments;
DROP POLICY "Members can view salon clients" ON public.clients;