
-- Add unique constraint on (salon_id, phone) where phone is not null to prevent duplicates
CREATE UNIQUE INDEX idx_clients_salon_phone_unique ON public.clients (salon_id, phone) WHERE phone IS NOT NULL;
