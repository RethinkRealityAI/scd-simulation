# Welcome Screen Configuration - Fix Summary

## Problem Identified

The welcome screen configuration was failing to save because of a **schema mismatch** between the database and the application code.

### Root Cause
- The `welcome_configurations` table was missing several columns that the code expected:
  - `instance_id` - Required for instance-specific configurations
  - `age_groups` - JSON array of age group options
  - `instructions` - Array of instruction text
  - `title` - Main title (code expected this, but DB had `main_title`)
  - `subtitle` - Subtitle text
  - `branding` - JSON object for colors and styling

### Console Errors Found
```
column welcome_configurations.instance_id does not exist
Could not find the 'age_groups' column of 'welcome_configurations' in the schema cache
```

## Solution Applied

### 1. Database Schema Fix
Created `FIX_WELCOME_SCHEMA.sql` which:
- ✅ Adds all missing columns without deleting any data
- ✅ Migrates data from old columns to new ones (e.g., `main_title` → `title`)
- ✅ Sets proper defaults for all fields
- ✅ Updates RLS policies to allow public access (for admin panel)
- ✅ Keeps old columns for backward compatibility

**CRITICAL UPDATE**: You must also run this command to fix the save error:
```sql
ALTER TABLE public.welcome_configurations ALTER COLUMN background_image_url DROP NOT NULL;
```
*This removes the constraint that was causing the "null value" error.*

### 2. Code Already Fixed
The following were already properly implemented:
- ✅ `useWelcomeConfig` hook with instance-specific loading
- ✅ `saveWelcomeConfiguration` function with proper error handling
- ✅ `EnhancedWelcomeScreenEditor` with toast notifications
- ✅ `updateNestedConfig` function for handling nested paths

## Steps to Complete the Fix

1. **Run the SQL Script** (You're doing this now)
   - Open Supabase Dashboard → SQL Editor
   - Paste contents of `FIX_WELCOME_SCHEMA.sql`
   - Click "Run"
   - ✅ This will add all missing columns

2. **Refresh the Browser**
   - After running the SQL, refresh your admin panel
   - The welcome screen editor should now work

3. **Test the Welcome Screen Editor**
   - Navigate to Instance Management → Select an instance
   - Click "Welcome Screen" tab
   - Make changes to any field
   - Click "Save Configuration"
   - ✅ Should see green success toast: "Configuration saved successfully!"
   - Refresh the page
   - ✅ Changes should persist

## What Each Column Does

| Column | Purpose | Default Value |
|--------|---------|---------------|
| `instance_id` | Links config to specific instance (NULL = global) | NULL |
| `age_groups` | Age group options for welcome form | 5 age ranges (18-24, 25-34, etc.) |
| `instructions` | Step-by-step instructions shown on welcome screen | 4 instruction items |
| `title` | Main heading on welcome screen | "Sickle Cell Disease Simulation" |
| `subtitle` | Subheading text | "A case-based learning experience..." |
| `branding` | Colors, fonts, and styling | Blue/indigo/cyan theme |
| `form_title` | Title above the form | "Participant Information" |
| `form_subtitle` | Text below form title | "Please provide your details..." |
| `form_backdrop_blur` | CSS blur effect | "backdrop-blur-md" |
| `form_background_opacity` | Form background transparency | 10 |
| `form_border_opacity` | Form border transparency | 20 |

## Expected Behavior After Fix

### Instance-Specific Configurations
- Each instance can have its own welcome screen settings
- Global config (instance_id = NULL) serves as default
- Instance-specific configs override global settings

### Save Functionality
- ✅ Changes save immediately to database
- ✅ Success/error toast notifications appear
- ✅ Changes persist after page refresh
- ✅ No console errors

### Live Preview
- ✅ Preview tab shows real-time changes
- ✅ Preview matches actual welcome screen appearance

## Verification Checklist

After running the SQL script:

- [ ] No console errors when loading welcome screen editor
- [ ] Can edit all fields (colors, text, form fields)
- [ ] Save button shows "Saving..." then success toast
- [ ] Changes persist after refresh
- [ ] Instance-specific configs work independently
- [ ] Live preview updates reactively
- [ ] No database errors in console

## Additional Notes

- The SQL script is **safe to run multiple times** (uses `IF NOT EXISTS`)
- **No data will be lost** - only adds columns and migrates data
- Old columns are kept for backward compatibility
- RLS policies allow public access for the admin panel (no auth required)
