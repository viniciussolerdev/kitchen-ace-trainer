
-- Add confirmation fields to appointments table
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS confirmation_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reminder_24h_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_3h_sent boolean NOT NULL DEFAULT false;

-- Create index on confirmation_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_appointments_confirmation_token ON public.appointments(confirmation_token) WHERE confirmation_token IS NOT NULL;

-- Create index for reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminders ON public.appointments(start_time, status, reminder_24h_sent, reminder_3h_sent) WHERE status = 'scheduled';

-- Function to auto-generate confirmation token on insert
CREATE OR REPLACE FUNCTION public.generate_confirmation_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_confirmation_token
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_confirmation_token();

-- Allow anon to update appointment status via token (for confirm/cancel endpoints)
CREATE POLICY "Anon can update appointment via token"
  ON public.appointments
  FOR UPDATE
  TO anon
  USING (confirmation_token IS NOT NULL)
  WITH CHECK (confirmation_token IS NOT NULL);
