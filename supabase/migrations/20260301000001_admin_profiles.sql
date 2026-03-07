/*
  # Admin Profiles Table

  Tracks registered admin users and their roles.
  Any authenticated Supabase user whose email appears here is treated as an admin.

  ## Roles
  - super_admin : full access, can create/remove other admins
  - admin       : standard administrative access
  - editor      : read + content editing only (future-use)
*/

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read all profiles (needed to list admins in the panel)
CREATE POLICY "admins_read_admin_profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated USING (true);

-- Authenticated users may insert profiles (when onboarding themselves or creating a new admin)
CREATE POLICY "admins_insert_admin_profiles"
  ON public.admin_profiles FOR INSERT
  TO authenticated WITH CHECK (true);

-- Authenticated users may update profiles
CREATE POLICY "admins_update_admin_profiles"
  ON public.admin_profiles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Authenticated users may delete profiles (to remove admin access)
CREATE POLICY "admins_delete_admin_profiles"
  ON public.admin_profiles FOR DELETE
  TO authenticated USING (true);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
