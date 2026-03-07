# Supabase Setup Guide for SCD Simulation

This guide walks you through setting up the database and storage for the Sickle Cell Disease simulation application.

## Prerequisites

1. A Supabase account (create one at [supabase.com](https://supabase.com))
2. A Supabase project created
3. Your Supabase project URL and anon key

## Step 1: Configure Environment Variables

Create a `.env` file in the `project` directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 2: Run Database Migrations

All migrations are located in `project/supabase/migrations/`. Run them in order:

### Using Supabase CLI (Recommended)

```bash
cd project
npx supabase db push
```

### Manual Migration (via Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in chronological order:
   - `20250915141959_shiny_dust.sql`
   - `20250915163313_turquoise_shore.sql`
   - `20250915164232_empty_lake.sql`
   - `20250915165718_curly_bread.sql`
   - `20250915171348_proud_stream.sql`
   - `20250915183332_velvet_villa.sql`
   - `20250916120000_scene_configurations.sql`
   - `20250101000000_welcome_configurations.sql`
   - `20250116000000_fix_session_data_policies.sql`
   - **`20250201000000_complete_database_schema.sql`** (NEW - CRITICAL!)

## Step 3: Create Storage Buckets

Storage buckets must be created manually via the Supabase Dashboard:

### 1. Create `simulation-videos` Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Bucket name: `simulation-videos`
4. **Make it public**: ✅ Yes
5. File size limit: 52428800 (50MB)
6. Allowed MIME types: `video/*,image/*`
7. Click **Create bucket**

### 2. Create `character-avatars` Bucket

1. Click **New bucket**
2. Bucket name: `character-avatars`
3. **Make it public**: ✅ Yes
4. File size limit: 5242880 (5MB)
5. Allowed MIME types: `image/*`
6. Click **Create bucket**

### 3. Create `scene-audio-files` Bucket

1. Click **New bucket**
2. Bucket name: `scene-audio-files`
3. **Make it public**: ✅ Yes
4. File size limit: 10485760 (10MB)
5. Allowed MIME types: `audio/*`
6. Click **Create bucket**

## Step 4: Verify Setup

### Check Tables

In the SQL Editor, run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

You should see:
- ✅ `simulation_videos`
- ✅ `scene_characters`
- ✅ `scene_audio_files`
- ✅ `scene_configurations`
- ✅ `user_analytics`
- ✅ `welcome_configurations`

### Check Storage Buckets

In the Storage section, you should see:
- ✅ `simulation-videos` (public)
- ✅ `character-avatars` (public)
- ✅ `scene-audio-files` (public)

### Test Connection

Run the development server and check the console:

```bash
npm run dev
```

The app should connect successfully without database errors.

## Database Schema Overview

### Core Tables

#### `simulation_videos`
Stores video content for each simulation scene (1-10).
- **Primary Key:** `id` (UUID)
- **Unique:** `scene_id` (1-10)
- **Fields:** title, description, video_url, poster_url, audio_narration_url

#### `scene_characters`
Stores character information with avatars.
- **Primary Key:** `id` (UUID)
- **Fields:** scene_id, character_name, character_role, avatar_url, display_order

#### `scene_audio_files`
Audio narration linked to characters.
- **Primary Key:** `id` (UUID)
- **Foreign Key:** `character_id` → `scene_characters.id`
- **Fields:** scene_id, audio_title, audio_description, audio_url, auto_play, hide_player

#### `scene_configurations`
Configurable scene content (quiz questions, action prompts, discussion prompts).
- **Primary Key:** `id` (UUID)
- **Unique:** `scene_id` (1-10)
- **Fields:** title, description, quiz_questions (JSONB), action_prompts (JSONB), discussion_prompts (JSONB), clinical_findings (JSONB), scoring_categories (JSONB), vitals_config (JSONB)

#### `user_analytics`
User performance data and analytics.
- **Primary Key:** `id` (UUID)
- **Unique:** `session_id`
- **Fields:** user_demographics (JSONB), responses (JSONB), category_scores (JSONB), final_score, completion_time, completed_scenes (JSONB)

#### `welcome_configurations`
Welcome screen styling and content.
- **Primary Key:** `id` (UUID)
- **Fields:** background_image_url, main_title, gradient_title, subtitle, features (JSONB), form_fields (JSONB), modal_steps (JSONB)

## Security & Policies

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Public Read:** Anyone can read data (for simulation playback)
- **Authenticated Write:** Only authenticated users (admins) can create/update/delete

### Storage Policies

All storage buckets are **public** to allow:
- Direct video/audio playback without authentication
- Character avatars to display in the UI
- Easy content delivery via CDN

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Check that your Supabase project is active (not paused)
3. Verify RLS policies are correctly set

### Upload Errors

If file uploads fail:
1. Ensure storage buckets are marked as **public**
2. Check file size limits match your bucket configuration
3. Verify bucket names match exactly: `simulation-videos`, `character-avatars`, `scene-audio-files`

### Migration Errors

If migrations fail:
1. Check for existing tables (some might already exist from previous runs)
2. The migrations use `IF NOT EXISTS` clauses to prevent conflicts
3. You can safely re-run the `20250201000000_complete_database_schema.sql` migration

## Next Steps

After setup is complete:

1. Access the admin portal at `/admin`
2. Upload videos for each scene (1-10)
3. Create characters with avatars
4. Upload audio narration files
5. Configure scene content (quiz questions, discussion prompts)
6. Customize the welcome screen

## Support

For issues or questions:
- Check Supabase logs in the Dashboard → Logs
- Review the browser console for client-side errors
- Verify all migrations ran successfully in SQL Editor → History

