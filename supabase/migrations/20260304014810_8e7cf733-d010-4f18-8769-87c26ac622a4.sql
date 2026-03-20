CREATE OR REPLACE FUNCTION public.generate_confirmation_token()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token := encode(extensions.gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$function$;