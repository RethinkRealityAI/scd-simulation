# Quick Start: Apply Migrations to Supabase

## ⚡ Fast Track (5 Minutes)

Since the Supabase MCP is experiencing connection issues, follow these simple steps to apply the migrations manually.

---

## Step 1: Open Supabase Dashboard

1. Go to **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** in the left sidebar

---

## Step 2: Apply Migration 1 - Scene Ordering System

### Instructions:
1. In SQL Editor, click **"New Query"**
2. Open the file: **`apply-migration-1.sql`** (in your project root)
3. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
4. **Paste** into the SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)
6. ✅ You should see: "Migration 1 completed successfully!" with scene_count: 10

### What this creates:
- ✅ `scene_order` table (manages scene display order)
- ✅ `scene_management_settings` table (global settings)
- ✅ 10 default scenes (1-10)
- ✅ 3 settings (max_scenes, allow_custom_scenes, completion_scene_required)

---

## Step 3: Apply Migration 2 - Anonymous Access Policies

### Instructions:
1. Click **"New Query"** again (or press Ctrl+K)
2. Open the file: **`apply-migration-2-anon-policies.sql`**
3. **Copy ALL the contents**
4. **Paste** into the SQL Editor
5. Click **"Run"**
6. ✅ You should see: "Migration 2 completed successfully!"

### What this fixes:
- ✅ Anonymous users can view videos
- ✅ Anonymous users can view scene configurations
- ✅ Anonymous users can submit session data
- ✅ Public simulation works without login

---

## Step 4: Verify Everything Works

Run this verification query in SQL Editor:

```sql
-- Check tables exist
SELECT 
  'scene_order' as table_name,
  (SELECT COUNT(*) FROM scene_order) as row_count
UNION ALL
SELECT 
  'scene_management_settings',
  (SELECT COUNT(*) FROM scene_management_settings)
UNION ALL
SELECT 
  'simulation_videos',
  (SELECT COUNT(*) FROM simulation_videos)
UNION ALL
SELECT 
  'scene_configurations',
  (SELECT COUNT(*) FROM scene_configurations);
```

**Expected Results:**
- `scene_order`: 10 rows
- `scene_management_settings`: 3 rows
- `simulation_videos`: (your videos)
- `scene_configurations`: (your scenes)

---

## Step 5: Test the Admin Portal

1. Navigate to your app: `/admin`
2. Test these features:

### ✅ Simulation Instances
- Click "Simulation Instances" tab
- Should load without errors
- Try creating a new instance

### ✅ Videos
- Click "Videos" tab
- Should show uploaded videos
- Try uploading a test video (< 50MB)

### ✅ Scene Management
- Click "Scene Management" tab
- Should show 10 scenes in order
- Try dragging to reorder
- Try setting a completion scene

### ✅ Analytics
- Click "Analytics" tab
- Should show session data

---

## Common Issues & Solutions

### Issue: "relation 'scene_order' already exists"

**Solution:** The table exists. Skip Migration 1 or run:
```sql
DROP TABLE IF EXISTS scene_order CASCADE;
DROP TABLE IF EXISTS scene_management_settings CASCADE;
```
Then rerun Migration 1.

---

### Issue: "Videos not loading in admin"

**Solution:** Check RLS policies:
```sql
SELECT tablename, policyname, roles 
FROM pg_policies 
WHERE tablename = 'simulation_videos';
```

Should show policies for `anon` and `public` roles.

---

### Issue: "Cannot insert session data"

**Solution:** Run Migration 2 again to fix anonymous insert policies.

---

### Issue: "Scene order not saving"

**Solution:** Verify the authenticated policy exists:
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'scene_order' 
  AND roles @> ARRAY['authenticated'];
```

---

## What's Fixed

### ✅ Before these migrations:
- ❌ Scene list wouldn't load (missing `scene_order` table)
- ❌ Videos couldn't upload (RLS policy issues)
- ❌ Simulation instances not showing (connection/policy issues)
- ❌ Scene management settings missing

### ✅ After these migrations:
- ✅ Scene list loads and displays all scenes
- ✅ Videos upload successfully
- ✅ Simulation instances display correctly
- ✅ Scene management fully functional
- ✅ Anonymous users can use the public simulation
- ✅ Admin can manage everything without authentication issues

---

## Next Steps

1. **Test thoroughly** - Try all admin features
2. **Upload videos** - Add videos for each scene
3. **Configure scenes** - Customize quiz questions and prompts
4. **Create instances** - Set up institutional instances
5. **Test public simulation** - Verify anonymous users can complete simulations

---

## Support Files

- `apply-migration-1.sql` - Scene ordering system (in project root)
- `apply-migration-2-anon-policies.sql` - Anonymous access policies (in project root)
- `APPLY_MIGRATIONS_GUIDE.md` - Detailed migration guide
- Original migrations in `supabase/migrations/` folder

---

## Need Help?

If you encounter any issues:

1. Check the **Supabase Logs** (Dashboard → Logs)
2. Check **Browser Console** for JavaScript errors
3. Verify **Environment Variables** are set correctly
4. Check **Storage Buckets** exist and are public

---

**Estimated Time:** 5 minutes  
**Difficulty:** Easy  
**Result:** Fully functional admin portal ✨





