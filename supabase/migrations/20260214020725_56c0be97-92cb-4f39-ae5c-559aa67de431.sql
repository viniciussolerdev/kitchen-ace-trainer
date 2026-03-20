
-- Replace handle_new_user to auto-create salon, profile, and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _salon_name text;
  _full_name text;
  _slug text;
  _salon_id uuid;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  _salon_name := COALESCE(NEW.raw_user_meta_data->>'salon_name', 'Meu Salão');
  _slug := lower(regexp_replace(unaccent(_salon_name), '[^a-z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 4);

  -- Create salon
  INSERT INTO public.salons (name, slug)
  VALUES (_salon_name, _slug)
  RETURNING id INTO _salon_id;

  -- Create profile
  INSERT INTO public.profiles (user_id, salon_id, full_name)
  VALUES (NEW.id, _salon_id, _full_name);

  -- Create admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');

  -- Create default booking settings
  INSERT INTO public.public_booking_settings (salon_id)
  VALUES (_salon_id);

  RETURN NEW;
END;
$$;

-- Enable unaccent extension for slug generation
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create the trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
