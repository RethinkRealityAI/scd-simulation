# Netlify Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- A Netlify account (free tier works great)
- Your Supabase project URL and anon key
- Git repository pushed to GitHub/GitLab/Bitbucket

### 2. Netlify Setup

#### Option A: Deploy via Netlify UI
1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select this repository
5. Netlify will auto-detect the `netlify.toml` configuration
6. Verify the build settings:
   - **Base directory**: `project`
   - **Build command**: `npm run build`
   - **Publish directory**: `project/dist`

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Navigate to your project root
cd path/to/SCD-simulation

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### 3. Environment Variables

**CRITICAL**: Set these in Netlify before deploying:

1. Go to your site in Netlify Dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
VITE_SUPABASE_URL = your-supabase-project-url
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
```

**Example:**
```
VITE_SUPABASE_URL = https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Database Migration

Before your first deployment, ensure your Supabase database is set up:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   ```sql
   -- Run each migration file from project/supabase/migrations/
   -- in chronological order based on timestamp
   ```

Or use Supabase CLI:
```bash
cd project
npx supabase db push
```

### 5. Verify Deployment

After deployment:
1. ✅ Check the build log for any errors
2. ✅ Visit your deployed site URL
3. ✅ Test the welcome screen loads
4. ✅ Test admin portal at `/admin`
5. ✅ Verify database connectivity

### 6. Custom Domain (Optional)

To add a custom domain:
1. In Netlify Dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. Netlify provides free SSL certificates automatically

## 📁 Project Structure

```
SCD-simulation/
├── netlify.toml          # Netlify configuration (root level)
├── .nvmrc                # Node version specification
├── project/              # Base directory for build
│   ├── src/              # React source code
│   ├── dist/             # Build output (generated)
│   ├── package.json      # Dependencies
│   ├── vite.config.ts    # Vite configuration
│   └── supabase/         # Database migrations
│       └── migrations/
└── DEPLOYMENT_GUIDE.md   # This file
```

## 🔧 Configuration Details

### netlify.toml Settings

- **Base directory**: `project` - Tells Netlify to work from the project folder
- **Build command**: `npm run build` - Runs Vite build
- **Publish directory**: `dist` - Where built files are located (relative to base)
- **Redirects**: SPA routing configured for React Router
- **Headers**: Security and caching headers optimized

### Build Process

1. Netlify changes to `project` directory
2. Runs `npm install` automatically
3. Executes `npm run build`
4. Deploys contents of `project/dist` folder

## 🐛 Troubleshooting

### Build Fails
- **Check Node version**: Ensure using Node 18 (specified in `.nvmrc`)
- **Check dependencies**: Run `npm install` locally first
- **Check environment variables**: Verify they're set in Netlify

### App Loads but No Data
- **Check Supabase URL**: Verify environment variables are correct
- **Check database**: Ensure migrations have been run
- **Check browser console**: Look for API errors

### Routes Not Working (404 errors)
- **Verify redirects**: Check that `netlify.toml` redirects are configured
- **Clear Netlify cache**: Trigger a new deploy

### Database Connection Issues
- **Verify anon key**: Check it's the correct key from Supabase
- **Check RLS policies**: Ensure Row Level Security policies allow access
- **Test locally first**: Use same environment variables locally

## 🔄 Continuous Deployment

Once set up, Netlify will automatically:
- Deploy on every push to `main` branch
- Run build checks on pull requests
- Provide preview URLs for each branch

To disable auto-deploy:
1. Go to **Site settings** → **Build & deploy**
2. Click **Edit settings** under "Build settings"
3. Disable "Auto publishing"

## 📊 Monitoring

Netlify provides:
- **Build logs**: View detailed build output
- **Analytics**: Page views, top pages, bandwidth
- **Forms**: If you add Netlify Forms later
- **Functions**: If you add serverless functions later

## 🔐 Security Notes

1. **Never commit** `.env` files with real credentials
2. **Use environment variables** for all secrets
3. **Enable branch deploys** for testing before production
4. **Set up branch protection** in your Git provider
5. **Review Supabase RLS policies** before going live

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started)
- [React Router Deployment](https://reactrouter.com/en/main/start/tutorial#deploying)

## 🎉 Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up custom domain (if applicable)
3. Configure analytics
4. Set up monitoring/alerts
5. Share your deployed URL!

---

**Need Help?**
- Check Netlify build logs for specific errors
- Review browser console for runtime errors
- Verify Supabase connection in Network tab
- Test locally with same environment variables first

