/*
  # Atomic first-admin bootstrap RPC

  Replaces the frontend-side bootstrap insert with a database-side function that:
  - only allows the current authenticated user to bootstrap themself
  - atomically checks whether any admin already exists
  - serializes concurrent bootstrap attempts with an advisory lock
*/

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(
  _user_id UUID,
  _email TEXT,
  _full_name TEXT DEFAULT NULL
)
RETURNS public.admin_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_profile public.admin_profiles;
  created_profile public.admin_profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'You may only bootstrap your own admin profile.';
  END IF;

  -- Serialize bootstrap attempts across concurrent clients.
  PERFORM pg_advisory_xact_lock(hashtext('bootstrap_first_admin'));

  SELECT *
  INTO existing_profile
  FROM public.admin_profiles
  WHERE id = _user_id;

  IF FOUND THEN
    RETURN existing_profile;
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_profiles) THEN
    RAISE EXCEPTION 'Admin bootstrap already completed.';
  END IF;

  INSERT INTO public.admin_profiles (
    id,
    email,
    full_name,
    role,
    is_active,
    created_by
  )
  VALUES (
    _user_id,
    _email,
    _full_name,
    'super_admin',
    true,
    NULL
  )
  RETURNING *
  INTO created_profile;

  RETURN created_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(UUID, TEXT, TEXT) TO authenticated;
