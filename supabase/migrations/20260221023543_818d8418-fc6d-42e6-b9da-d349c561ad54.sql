
-- Create business_hours table for salon working hours
CREATE TABLE public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME NOT NULL DEFAULT '08:00',
  close_time TIME NOT NULL DEFAULT '19:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anon can view business hours" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Members can view salon business hours" ON public.business_hours FOR SELECT USING (salon_id = get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert business hours" ON public.business_hours FOR INSERT WITH CHECK (is_salon_admin(auth.uid()) AND salon_id = get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can update business hours" ON public.business_hours FOR UPDATE USING (is_salon_admin(auth.uid()) AND salon_id = get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can delete business hours" ON public.business_hours FOR DELETE USING (is_salon_admin(auth.uid()) AND salon_id = get_user_salon_id(auth.uid()));

-- Insert default business hours for existing salons
INSERT INTO public.business_hours (salon_id, day_of_week, is_open, open_time, close_time)
SELECT s.id, d.day, 
  CASE WHEN d.day = 0 THEN false ELSE true END,
  '08:00'::TIME, '19:00'::TIME
FROM public.salons s
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(day)
ON CONFLICT DO NOTHING;

-- Update handle_new_user to also create default business hours
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _salon_name text;
  _full_name text;
  _slug text;
  _salon_id uuid;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  _salon_name := COALESCE(NEW.raw_user_meta_data->>'salon_name', 'Meu Salão');
  _slug := lower(regexp_replace(unaccent(_salon_name), '[^a-z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 4);

  INSERT INTO public.salons (name, slug) VALUES (_salon_name, _slug) RETURNING id INTO _salon_id;
  INSERT INTO public.profiles (user_id, salon_id, full_name) VALUES (NEW.id, _salon_id, _full_name);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  INSERT INTO public.public_booking_settings (salon_id) VALUES (_salon_id);

  -- Create default business hours (closed on Sunday)
  INSERT INTO public.business_hours (salon_id, day_of_week, is_open, open_time, close_time)
  VALUES
    (_salon_id, 0, false, '08:00', '19:00'),
    (_salon_id, 1, true, '08:00', '19:00'),
    (_salon_id, 2, true, '08:00', '19:00'),
    (_salon_id, 3, true, '08:00', '19:00'),
    (_salon_id, 4, true, '08:00', '19:00'),
    (_salon_id, 5, true, '08:00', '19:00'),
    (_salon_id, 6, true, '08:00', '18:00');

  RETURN NEW;
END;
$function$;
