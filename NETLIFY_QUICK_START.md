# 🚀 Netlify Deployment - Quick Start

## ✅ Ready to Deploy!

All files have been committed and pushed. Your project is ready for Netlify deployment.

## 🎯 Next Steps (5 Minutes)

### 1. Go to Netlify
Visit: https://app.netlify.com

### 2. Import Your Repository
- Click **"Add new site"** → **"Import an existing project"**
- Connect to your Git provider (GitHub)
- Select this repository: `scd-simulation`

### 3. Netlify Will Auto-Configure ✨
The `netlify.toml` file will automatically set:
- ✅ Base directory: `project`
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Node version: 18

**Just click "Deploy site"!**

### 4. Set Environment Variables (IMPORTANT!)
Before the build completes, add these in Netlify:

1. Go to: **Site settings** → **Environment variables**
2. Add these two variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

**Where to find these:**
- Go to your Supabase project
- Navigate to **Project Settings** → **API**
- Copy the **URL** and **anon/public key**

### 5. Redeploy
- After adding environment variables
- Click **"Trigger deploy"** to rebuild with the correct env vars

### 6. Run Database Migrations
In Supabase SQL Editor, run the migration file:
```sql
-- Run: project/supabase/migrations/20250101000000_welcome_configurations.sql
```

## 🎉 That's It!

Your site will be live at: `https://your-site-name.netlify.app`

## 📋 Checklist

- [ ] Repository pushed to GitHub ✅ (Done!)
- [ ] Netlify account created
- [ ] Site imported from GitHub
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Site deployed successfully
- [ ] Admin portal accessible at `/admin`
- [ ] Welcome screen editor works

## 🔗 Quick Links

- **Netlify Dashboard**: https://app.netlify.com
- **Supabase Dashboard**: https://app.supabase.com
- **Full Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

## 💡 Pro Tips

1. **Branch Previews**: Netlify will create preview URLs for each PR
2. **Custom Domain**: Free SSL included with custom domains
3. **Build Logs**: Check if deployment fails
4. **Environment Variables**: Can be different per branch (staging vs production)

## 🐛 If Something Goes Wrong

1. Check Netlify build logs
2. Verify environment variables are set correctly
3. Ensure Supabase project is accessible
4. Test locally first: `cd project && npm run dev`

---

**Ready to deploy?** Go to Netlify now! 🚀

