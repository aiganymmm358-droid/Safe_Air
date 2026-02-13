-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Users can view their own environment data" ON public.user_environment_data;
DROP POLICY IF EXISTS "Users can insert their own environment data" ON public.user_environment_data;
DROP POLICY IF EXISTS "Users can update their own environment data" ON public.user_environment_data;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Users can view their own environment data"
ON public.user_environment_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own environment data"
ON public.user_environment_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own environment data"
ON public.user_environment_data
FOR UPDATE
USING (auth.uid() = user_id);