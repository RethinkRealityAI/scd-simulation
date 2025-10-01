# 🔧 Fix Blank White Screen on Netlify

## ❌ Problem
Your Netlify deployment shows a **blank white screen** with this console error:
```
Uncaught Error: supabaseUrl is required.
```

## ✅ Solution: Add Environment Variables

### Step-by-Step Fix

#### 1. Get Your Supabase Credentials

1. Go to https://app.supabase.com
2. Open your project
3. Click the **Settings** gear icon (bottom left)
4. Click **API** in the left sidebar
5. You'll see two important values:
   - **Project URL** (looks like: `https://abcdefg.supabase.co`)
   - **anon public** key (very long string starting with `eyJ...`)

#### 2. Add Variables to Netlify

1. Go to your Netlify site dashboard
2. Click **Site settings**
3. Click **Environment variables** in the left sidebar
4. Click **Add a variable** button
5. Add the first variable:
   ```
   Key: VITE_SUPABASE_URL
   Value: [paste your Project URL here]
   ```
6. Click **Add a variable** again
7. Add the second variable:
   ```
   Key: VITE_SUPABASE_ANON_KEY
   Value: [paste your anon public key here]
   ```
8. Click **Save**

#### 3. Redeploy Your Site

1. Go to **Deploys** tab
2. Click **Trigger deploy** dropdown
3. Click **Deploy site**
4. Wait for build to complete (~2-3 minutes)
5. Visit your site - it should work now! ✅

## 📸 Visual Guide

### Finding Supabase Keys:
```
Supabase Dashboard
└── Your Project
    └── Settings (⚙️ icon)
        └── API
            ├── Project URL ← Copy this
            └── anon public ← Copy this
```

### Adding to Netlify:
```
Netlify Dashboard
└── Your Site
    └── Site settings
        └── Environment variables
            └── Add a variable
                ├── VITE_SUPABASE_URL = [your-url]
                └── VITE_SUPABASE_ANON_KEY = [your-key]
```

## ⚠️ Common Mistakes

### ❌ Wrong Variable Names
```
WRONG: SUPABASE_URL
WRONG: VITE_SUPABASE
WRONG: supabase_url
RIGHT: VITE_SUPABASE_URL ✅
```

Variable names must be **EXACTLY**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### ❌ Using Wrong Key
- ✅ Use: **anon public** key
- ❌ Don't use: **service_role** key (that's for backend only)

### ❌ Extra Spaces
Make sure there are no spaces before or after your values:
```
❌ " https://abc.supabase.co"  (space at start)
❌ "https://abc.supabase.co "  (space at end)
✅ "https://abc.supabase.co"   (no spaces)
```

### ❌ Forgetting to Redeploy
Environment variables only apply to NEW builds. You must:
1. Add the variables
2. **Then** trigger a new deploy

## 🧪 How to Test

### Before Fix:
- ✅ Build succeeds in Netlify
- ❌ Site shows blank white screen
- ❌ Console shows: "supabaseUrl is required"

### After Fix:
- ✅ Build succeeds in Netlify
- ✅ Site loads with welcome screen
- ✅ No console errors
- ✅ Can navigate to admin portal

## 🔍 Verify It's Working

1. Open your Netlify site URL
2. Press F12 to open DevTools
3. Look at Console tab:
   - ✅ Should see Vite connection messages
   - ✅ Should see React DevTools message
   - ❌ Should NOT see "supabaseUrl is required"

## 💡 For Local Development

If you're developing locally, create a `.env` file in the `project` folder:

```env
# project/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Never commit this file to Git!** (it's already in `.gitignore`)

## 📚 Related Files

- `project/.env.example` - Template for local env file
- `project/src/lib/supabase.ts` - Now validates env vars
- `NETLIFY_QUICK_START.md` - Full deployment guide
- `DEPLOYMENT_GUIDE.md` - Detailed deployment docs

## 🆘 Still Not Working?

### Check Build Logs
1. Go to Netlify **Deploys** tab
2. Click on the latest deploy
3. Check for any build errors

### Check Environment Variables Are Set
1. In Netlify: **Site settings** → **Environment variables**
2. Verify both variables are listed
3. Click "Edit" to verify values (check for typos)

### Check Supabase Project Status
1. Go to https://app.supabase.com
2. Make sure your project is active (not paused)
3. Check project URL is accessible

### Clear Netlify Build Cache
1. Go to **Site settings** → **Build & deploy**
2. Click **Clear cache and retry deploy**
3. Trigger a fresh deploy

### Check Browser
- Try in incognito/private mode
- Try a different browser
- Clear browser cache (Ctrl+Shift+Del)

## ✅ Success Checklist

- [ ] Supabase project is active
- [ ] Got Project URL from Supabase
- [ ] Got anon public key from Supabase
- [ ] Added `VITE_SUPABASE_URL` to Netlify (exact name)
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Netlify (exact name)
- [ ] Triggered new deploy
- [ ] Build completed successfully
- [ ] Site loads (not blank)
- [ ] No console errors
- [ ] Welcome screen shows

---

**Once environment variables are set, your site will work perfectly!** 🎉

The changes have been committed and pushed. After you add the environment variables in Netlify and redeploy, everything will work.

