
-- Allow users to read their own profile by user_id (needed for initial profile fetch)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());
