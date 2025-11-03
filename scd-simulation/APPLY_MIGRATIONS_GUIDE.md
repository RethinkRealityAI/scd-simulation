# Supabase Migration Application Guide

## Migrations Created

I've created two new migration files that need to be applied to your Supabase database:

1. **`supabase/migrations/20250126000000_scene_ordering_system.sql`**
   - Creates `scene_order` table for managing scene display order
   - Creates `scene_management_settings` table for global settings
   - Sets up RLS policies for anonymous and authenticated access
   - Seeds default data for 10 scenes

2. **`supabase/migrations/20250126000001_fix_anon_access_policies.sql`**
   - Fixes RLS policies to allow anonymous users to read videos, scenes, and configurations
   - Allows anonymous users to insert session data
   - Critical for the public simulation to work without authentication

## Option 1: Apply via Supabase Dashboard SQL Editor (RECOMMENDED)

This is the easiest method if you don't have the CLI installed.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply First Migration**
   - Copy the entire contents of `supabase/migrations/20250126000000_scene_ordering_system.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Verify no errors appear

4. **Apply Second Migration**
   - Click "New Query" again
   - Copy the entire contents of `supabase/migrations/20250126000001_fix_anon_access_policies.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Verify no errors appear

5. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should now see:
     - `scene_order` (with 10 rows of default data)
     - `scene_management_settings` (with 3 rows of settings)

## Option 2: Install Supabase CLI and Use Migration Commands

### Install Supabase CLI:

```bash
# Using npm
npm install -g supabase

# Using scoop (Windows)
scoop install supabase

# Using chocolatey (Windows)
choco install supabase
```

### Link to Your Project:

```bash
# Navigate to your project directory
cd "C:\Users\devel\OneDrive\Documents\SCAGO\YEP\SCD-simulation\project"

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

### Apply Migrations:

```bash
# Apply all pending migrations
supabase db push

# Or apply migrations remotely
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Option 3: Manual SQL Execution via psql

If you have direct database access:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/20250126000000_scene_ordering_system.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/20250126000001_fix_anon_access_policies.sql
```

## Verification Steps

After applying the migrations, verify everything is working:

### 1. Check Tables Exist

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('scene_order', 'scene_management_settings');
```

Expected result: 2 rows showing both tables

### 2. Check Default Data

```sql
-- Should return 10 rows (scenes 1-10)
SELECT * FROM scene_order ORDER BY display_order;

-- Should return 3 rows (settings)
SELECT * FROM scene_management_settings;
```

### 3. Check RLS Policies

```sql
-- Should show multiple policies for each table
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('scene_order', 'scene_management_settings', 'simulation_videos', 'scene_configurations');
```

### 4. Test Anonymous Access

In your browser console on the app:

```javascript
// This should work without authentication
const { data, error } = await supabase
  .from('scene_order')
  .select('*')
  .eq('is_active', true);
  
console.log('Scene order:', data);
console.log('Error:', error);
```

## What These Migrations Fix

### Issues Resolved:

1. ✅ **Scene List Not Working**
   - Created missing `scene_order` table
   - Scene Management Dashboard can now load and display scenes

2. ✅ **Scene Management Settings Missing**
   - Created `scene_management_settings` table
   - Admin can now configure max scenes, custom scenes, etc.

3. ✅ **Video Upload Error (RLS Policies)**
   - Fixed anonymous access policies
   - Videos can now be viewed without authentication
   - Session data can be inserted by anonymous users

4. ✅ **Simulation Instances Not Showing**
   - Fixed RLS policies for anonymous read access
   - Instances can now be fetched by the admin portal

## Troubleshooting

### Error: "relation 'scene_order' already exists"

This means the table was already created. You can skip that migration or drop the table first:

```sql
DROP TABLE IF EXISTS scene_order CASCADE;
DROP TABLE IF EXISTS scene_management_settings CASCADE;
```

Then rerun the migration.

### Error: "permission denied for table..."

Make sure you're running the migrations as an admin user or with the proper credentials. In the Supabase Dashboard, you're automatically authenticated as an admin.

### Error: "policy already exists"

The migration scripts use `DROP POLICY IF EXISTS` before creating policies, so this shouldn't happen. If it does, you can manually drop the policies:

```sql
-- Example
DROP POLICY IF EXISTS "Anon can read simulation videos" ON simulation_videos;
```

## Next Steps After Migration

1. **Test the Admin Portal**
   - Navigate to `/admin` in your app
   - Try creating a simulation instance
   - Upload a video
   - Manage scenes

2. **Test the Public Simulation**
   - Go to the home page (`/`)
   - Verify videos load
   - Complete a simulation session
   - Check that data is saved

3. **Monitor the Database**
   - Check for any RLS policy errors in logs
   - Monitor query performance
   - Verify data is being saved correctly

## Support

If you encounter any issues:

1. Check the browser console for detailed error messages
2. Check Supabase logs in the Dashboard → Logs section
3. Verify your environment variables are set correctly
4. Ensure the storage buckets exist and are public

---

**Recommendation:** Use **Option 1** (Supabase Dashboard SQL Editor) as it's the quickest and most reliable method for applying these migrations.





