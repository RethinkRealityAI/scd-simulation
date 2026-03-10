/*
  # Public bootstrap availability RPC

  Allows the admin login page to determine whether the one-time
  "Create first super admin" path should be shown.
*/

CREATE OR REPLACE FUNCTION public.can_bootstrap_first_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.admin_profiles);
$$;

GRANT EXECUTE ON FUNCTION public.can_bootstrap_first_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.can_bootstrap_first_admin() TO authenticated;
