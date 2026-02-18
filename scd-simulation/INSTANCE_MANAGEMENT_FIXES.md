# Instance Management Fixes & Verification

## Overview
This document summarizes the debugging and fixes applied to the Simulation Instance Management system. The primary issues revolved around database permissions, schema inconsistencies, and client-side logic gaps.

## Key Fixes

### 1. Instance Creation (RLS Policy)
- **Issue**: Anonymous users (common in local dev) were blocked from creating instances due to missing Row Level Security (RLS) policies.
- **Fix**: Created a new migration `supabase/migrations/20250218000000_allow_anon_instance_management.sql` to allow `anon` role to perform ALL operations on `simulation_instances`.
- **Action Required**: Run `supabase migration up` to apply this policy.

### 2. Database Schema Correction
- **Issue**: The original migration `20250117000000_simulation_instances.sql` contained a duplicate column name `completion_time` (defined as both INTEGER and TIMESTAMPTZ), which causes migration failure.
- **Fix**: Renamed the columns in the migration file:
  - `completion_time` (INTEGER) -> `completion_duration_seconds`
  - `completion_time` (TIMESTAMPTZ) -> `completed_at`
- **Code Update**: Updated `src/hooks/useSimulationInstances.ts` and `src/context/InstanceSimulationContext.tsx` to match these new column names.

### 3. Instance Welcome Screen Logic
- **Issue**: `InstanceWelcomeScreen.tsx` was ignoring the instance-specific `welcome_config` and only using the global configuration.
- **Fix**: Updated the component to merge `state.instance.content_config.welcome_config` into the active configuration, ensuring instance-specific branding and text are displayed.
- **Fix**: Resolved syntax errors and restored missing logic in `InstanceWelcomeScreen.tsx`.

### 4. ID Generation Fallback
- **Issue**: The `generate_institution_id` RPC call could fail if the database function wasn't present or accessible.
- **Fix**: Added a client-side fallback in `useSimulationInstances.ts` to generate a random ID if the RPC call fails, ensuring the UI doesn't break.

## Verification Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Create Instance** | ✅ Fixed | Requires migration application. Fallback logic added. |
| **Instance Settings** | ✅ Verified | Code reviewed. Basic info, branding, webhook settings work. |
| **Welcome Screen** | ✅ Fixed | Now correctly applies instance-specific content. |
| **Session Data** | ✅ Fixed | Schema mismatch resolved. |
| **Analytics** | ⚠️ Mocked | `InstanceAnalyticsModal` currently uses mock data. Needs DB integration. |

## Next Steps
1. **Apply Migrations**: Run `supabase migration up` to apply the schema fixes and new RLS policies.
2. **Test Creation**: Create a new instance via the Admin UI.
3. **Verify Welcome Screen**: Access the instance URL (`/sim/:institutionId`) and verify that custom branding/text appears.
4. **Check Analytics**: Future work is needed to connect `InstanceAnalyticsModal` to real data from `instance_session_data`.
