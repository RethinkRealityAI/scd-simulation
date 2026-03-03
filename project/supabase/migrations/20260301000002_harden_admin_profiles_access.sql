/*
  # Harden Admin Profile Access

  Tightens authorization around admin management:
  - Users can read their own profile for access checks.
  - Only super admins can read all admin profiles and manage other admins.
  - First authenticated user may bootstrap as super_admin when table is empty.
  - Prevent demoting/deleting the last active super admin.
*/

-- Helper function: true when uid is an active super admin.
-- SECURITY DEFINER is required so policy checks do not recurse through RLS.
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.id = uid
      AND ap.is_active = true
      AND ap.role = 'super_admin'
  );
$$;

-- Helper function used in CHECK policies.
CREATE OR REPLACE FUNCTION public.has_any_admin_profiles()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_profiles);
$$;

-- Replace permissive policies from prior migration.
DROP POLICY IF EXISTS "admins_read_admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "admins_insert_admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "admins_update_admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "admins_delete_admin_profiles" ON public.admin_profiles;

-- Read:
-- - Everyone can read their own profile (needed for /admin access check).
-- - Super admins can read all profiles (needed for admin management list).
CREATE POLICY "admin_profiles_select_self_or_super_admin"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_super_admin(auth.uid())
  );

-- Insert:
-- - Super admins can insert any profile.
-- - Bootstrap: first authenticated user can insert self as active super_admin
--   only when there are no admin profiles yet.
CREATE POLICY "admin_profiles_insert_super_admin_or_bootstrap"
  ON public.admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR (
      id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
      AND NOT public.has_any_admin_profiles()
    )
  );

-- Update/Delete:
-- - Super admins only.
CREATE POLICY "admin_profiles_update_super_admin_only"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "admin_profiles_delete_super_admin_only"
  ON public.admin_profiles FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Replace generic updated_at trigger function with table-specific one.
DROP TRIGGER IF EXISTS admin_profiles_updated_at ON public.admin_profiles;

CREATE OR REPLACE FUNCTION public.set_admin_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_profiles_updated_at();

-- Ensure at least one active super admin always remains.
CREATE OR REPLACE FUNCTION public.prevent_last_super_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  remaining_super_admins INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'super_admin' AND OLD.is_active = true THEN
      SELECT COUNT(*)
      INTO remaining_super_admins
      FROM public.admin_profiles
      WHERE role = 'super_admin'
        AND is_active = true
        AND id <> OLD.id;

      IF remaining_super_admins = 0 THEN
        RAISE EXCEPTION 'At least one active super admin is required.';
      END IF;
    END IF;

    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'super_admin'
       AND OLD.is_active = true
       AND (NEW.role <> 'super_admin' OR NEW.is_active = false) THEN
      SELECT COUNT(*)
      INTO remaining_super_admins
      FROM public.admin_profiles
      WHERE role = 'super_admin'
        AND is_active = true
        AND id <> OLD.id;

      IF remaining_super_admins = 0 THEN
        RAISE EXCEPTION 'At least one active super admin is required.';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS admin_profiles_prevent_last_super_admin ON public.admin_profiles;

CREATE TRIGGER admin_profiles_prevent_last_super_admin
  BEFORE UPDATE OR DELETE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_super_admin_change();
