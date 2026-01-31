# Railway Deployment Guide for QSCostingPro

This guide walks you through deploying QSCostingPro to Railway.

## Prerequisites

1. **Railway Account** - Sign up at https://railway.app
2. **GitHub Repository** - Project must be on GitHub (already done ✓)
3. **GitHub Personal Access Token** (optional, but recommended for private repos)

## Deployment Steps

### Step 1: Connect to Railway

1. Go to https://railway.app/login
2. Click "Sign up with GitHub" or "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. On the dashboard, click "New Project" → "Deploy from GitHub repo"

### Step 2: Select Your Repository

1. Search for "QSCostingPro" in the repository list
2. Click on it to select
3. Railway will auto-detect the project configuration from `railway.json`

### Step 3: Configure Environment Variables

In the Railway dashboard for your project:

1. Go to the **Variables** tab
2. Add the following environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Required for production build |
| `JWT_SECRET` | `[generate a random 32+ char string]` | **CRITICAL**: Generate a secure random secret |
| `FRONTEND_URL` | `https://[railway-url].railway.app` | Your deployed Railway URL (will be provided) |
| `PORT` | `3000` | Express server port (Railway auto-assigns) |
| `LOG_LEVEL` | `info` | Log level (optional) |

**Generating JWT_SECRET:**
```bash
# Run this locally to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy

1. Railway will automatically build and deploy when you:
   - Select the repository
   - Set environment variables
   - Click "Deploy"

2. Or, it will auto-deploy on future pushes to `main` branch

**Build Process:**
- Installs dependencies for monorepo (client + server)
- Builds client (React app → `client/dist`)
- Builds server (TypeScript → `server/dist`)
- Starts server (serves both API and static frontend)

### Step 5: Verify Deployment

Once deployed, Railway will provide a URL like:
```
https://qscostingpro-production.railway.app
```

**Test the deployment:**
- ✅ Visit the URL in browser - should see login page
- ✅ Test login with admin / admin123456
- ✅ Check browser console for any API errors
- ✅ Test a few features (create project, build estimate, etc.)

## Environment Variables Details

### Required for Production

- **JWT_SECRET** - Generate a secure random string (minimum 32 characters)
  - Example: `e8f9a2b5c3d1e0f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`
  - Use `crypto.randomBytes(32).toString('hex')` to generate

### Auto-Set by Railway

- **PORT** - Set to 3000 (but Railway internally routes to your URL)
- **NODE_ENV** - Set to `production`

### Optional

- **FRONTEND_URL** - Set to your Railway deployment URL (for CORS)
- **LOG_LEVEL** - `info`, `warn`, `error`, `debug`
- **DATABASE_PATH** - Uses default in-memory path (SQLite)
- **UPLOAD_DIR** - Directory for uploads

## Database

**Current Setup:** SQLite (file-based)
- Database file: `server/database/khconstruct.db`
- Includes seed data (cost databases, initial user, etc.)

**For Production Upgrade:**
Consider migrating to PostgreSQL:
1. Railway offers PostgreSQL service integration
2. Would require code changes to support both SQLite and PostgreSQL
3. Better for multi-user deployments

**Current Limitations:**
- SQLite database file resets on Railway redeploys
- For persistent data, consider PostgreSQL migration (Phase 5?)

## Troubleshooting

### Blank Page / 404 on Routes
**Cause:** Client routes not being served by server
**Fix:** Already configured with SPA fallback in `server/src/index.ts`

### API 404 Errors
**Cause:** CORS or incorrect FRONTEND_URL
**Check:**
1. FRONTEND_URL matches Railway deployment URL
2. Browser console for CORS errors
3. API endpoints are /api/v1/* format

### "JWT_SECRET must be set"
**Fix:** Set JWT_SECRET in Railway variables tab
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Build Fails
**Check Railway logs:**
1. Go to Deployments tab
2. Click latest deployment
3. View build logs for errors
4. Common issues:
   - Missing environment variables
   - TypeScript compilation errors
   - Node.js version mismatch

## Post-Deployment

1. **Change Default Credentials**
   - Admin login: admin / admin123456
   - Create new admin user
   - Delete default user (recommended)

2. **Monitor Logs**
   - Railway dashboard → Logs tab
   - Watch for errors and performance issues

3. **Setup Auto-Deploy**
   - Railway auto-deploys on `main` branch pushes
   - No configuration needed

4. **Custom Domain (Optional)**
   - In Railway settings, add custom domain
   - Example: `qscostingpro.yourdomain.com`

## Cost Estimates

**Railway Pricing:**
- First $5/month free tier
- Typical cost for small app: $5-15/month
- Includes: compute, database, file storage

**Breakdown for QSCostingPro:**
- Node.js server: ~$3-5/month
- SQLite storage: ~$0-2/month
- Total: ~$3-7/month

## Performance

Current setup characteristics:
- **Response Time:** ~200-500ms (from server logic)
- **Startup Time:** ~5-10 seconds (migrations + seeding)
- **Database:** SQLite (good for <100 concurrent users)

## Next Steps (Optional Enhancements)

1. **PostgreSQL Migration** - Better for scale
2. **CDN for Static Assets** - Faster frontend delivery
3. **Monitoring** - New Relic or Datadog integration
4. **Backups** - Automated database backups
5. **Custom Domain** - Professional URL

## Support

**Issues?**
1. Check Railway logs: Dashboard → Logs
2. Verify environment variables set correctly
3. Check GitHub Actions for build issues
4. Review deployment configuration in railway.json

**Railway Docs:** https://docs.railway.app

---

**Happy Deploying! 🚀**
