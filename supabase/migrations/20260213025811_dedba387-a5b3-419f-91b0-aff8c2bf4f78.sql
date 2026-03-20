
-- ========================================
-- SmartSalon Database Schema
-- ========================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- 2. Create appointment status enum
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

-- 3. Create booking source enum
CREATE TYPE public.booking_source AS ENUM ('internal', 'online');

-- 4. Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('cash', 'credit_card', 'debit_card', 'pix', 'other');

-- 5. Create notification status enum
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'confirmed', 'failed');

-- ========================================
-- TABLES
-- ========================================

-- Salons
CREATE TABLE public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (links auth.users to a salon)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- User roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'employee',
  UNIQUE(user_id, role)
);

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Professionals
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  booking_source booking_source NOT NULL DEFAULT 'internal',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commissions
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WhatsApp Notifications
CREATE TABLE public.whatsapp_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ,
  response TEXT,
  status notification_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public Booking Settings
CREATE TABLE public.public_booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  advance_days INTEGER NOT NULL DEFAULT 30,
  min_advance_hours INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_salon_id ON public.profiles(salon_id);
CREATE INDEX idx_clients_salon_id ON public.clients(salon_id);
CREATE INDEX idx_professionals_salon_id ON public.professionals(salon_id);
CREATE INDEX idx_services_salon_id ON public.services(salon_id);
CREATE INDEX idx_appointments_salon_id ON public.appointments(salon_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_transactions_salon_id ON public.transactions(salon_id);
CREATE INDEX idx_commissions_salon_id ON public.commissions(salon_id);
CREATE INDEX idx_whatsapp_notifications_salon_id ON public.whatsapp_notifications(salon_id);
CREATE INDEX idx_salons_slug ON public.salons(slug);

-- ========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply to all tables with updated_at
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_public_booking_settings_updated_at BEFORE UPDATE ON public.public_booking_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ========================================

-- Get user's salon_id
CREATE OR REPLACE FUNCTION public.get_user_salon_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT salon_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is admin of their salon
CREATE OR REPLACE FUNCTION public.is_salon_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Check if user belongs to a salon (admin or employee)
CREATE OR REPLACE FUNCTION public.is_salon_member(_user_id UUID, _salon_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user_id AND salon_id = _salon_id
  )
$$;

-- ========================================
-- ENABLE RLS ON ALL TABLES
-- ========================================
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_booking_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- SALONS: members can view their salon, admins can update
CREATE POLICY "Members can view own salon" ON public.salons FOR SELECT TO authenticated
  USING (public.is_salon_member(auth.uid(), id));
CREATE POLICY "Admins can update own salon" ON public.salons FOR UPDATE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND public.get_user_salon_id(auth.uid()) = id);
CREATE POLICY "Authenticated users can create salons" ON public.salons FOR INSERT TO authenticated
  WITH CHECK (true);

-- PROFILES: members can view profiles in their salon, users can manage own
CREATE POLICY "Members can view salon profiles" ON public.profiles FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- USER ROLES: users can view own roles, admins can manage
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can insert own role during signup" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- CLIENTS: salon members can view, admins can manage
CREATE POLICY "Members can view salon clients" ON public.clients FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can update clients" ON public.clients FOR UPDATE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));

-- PROFESSIONALS: salon members can view, admins can manage
CREATE POLICY "Members can view salon professionals" ON public.professionals FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert professionals" ON public.professionals FOR INSERT TO authenticated
  WITH CHECK (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can update professionals" ON public.professionals FOR UPDATE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can delete professionals" ON public.professionals FOR DELETE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));

-- SERVICES: salon members can view, admins can manage; anon can view for public booking
CREATE POLICY "Members can view salon services" ON public.services FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Anon can view active services by salon" ON public.services FOR SELECT TO anon
  USING (is_active = true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));

-- APPOINTMENTS: salon members can view, admins can manage, anon can view for conflict check
CREATE POLICY "Members can view salon appointments" ON public.appointments FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Employees can insert appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can delete appointments" ON public.appointments FOR DELETE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
-- Anon can view appointments for conflict checking on public booking
CREATE POLICY "Anon can view appointments for booking" ON public.appointments FOR SELECT TO anon
  USING (true);

-- TRANSACTIONS: salon members can view, admins can manage
CREATE POLICY "Members can view salon transactions" ON public.transactions FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert transactions" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));

-- COMMISSIONS: salon members can view, admins can manage
CREATE POLICY "Members can view salon commissions" ON public.commissions FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert commissions" ON public.commissions FOR INSERT TO authenticated
  WITH CHECK (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));

-- WHATSAPP NOTIFICATIONS: salon members can view, admins can manage
CREATE POLICY "Members can view salon notifications" ON public.whatsapp_notifications FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert notifications" ON public.whatsapp_notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can update notifications" ON public.whatsapp_notifications FOR UPDATE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));

-- PUBLIC BOOKING SETTINGS: members can view, admins can manage, anon can view
CREATE POLICY "Members can view booking settings" ON public.public_booking_settings FOR SELECT TO authenticated
  USING (salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Anon can view booking settings" ON public.public_booking_settings FOR SELECT TO anon
  USING (true);
CREATE POLICY "Admins can update booking settings" ON public.public_booking_settings FOR UPDATE TO authenticated
  USING (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));
CREATE POLICY "Admins can insert booking settings" ON public.public_booking_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_salon_admin(auth.uid()) AND salon_id = public.get_user_salon_id(auth.uid()));

-- PROFESSIONALS: anon can view for public booking
CREATE POLICY "Anon can view active professionals" ON public.professionals FOR SELECT TO anon
  USING (is_active = true);

-- SALONS: anon can view by slug for public booking
CREATE POLICY "Anon can view salon by slug" ON public.salons FOR SELECT TO anon
  USING (true);

-- CLIENTS: anon can insert for public booking (creates client record)
CREATE POLICY "Anon can insert clients for booking" ON public.clients FOR INSERT TO anon
  WITH CHECK (true);

-- APPOINTMENTS: anon can insert for public booking
CREATE POLICY "Anon can insert appointments for booking" ON public.appointments FOR INSERT TO anon
  WITH CHECK (booking_source = 'online');

-- ========================================
-- AUTO-CREATE PROFILE + ROLE ON SIGNUP (via trigger)
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile and salon creation will be handled in the signup flow
  -- This is a placeholder for future auto-profile creation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
