# 🚀 Deploy VibeBox Backend to Vercel

## Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub account
- MySQL database (free options: Railway, PlanetScale, Aiven)

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/vibebox-backend.git
git push -u origin main
```

### 2. Set Up Database

You have several options:

#### Option A: Railway (Recommended for Beginners)
1. Go to [railway.app](https://railway.app)
2. Create new project → Add MySQL
3. Copy the connection details

#### Option B: PlanetScale
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection strings

#### Option C: Your Existing MySQL
- Ensure it's publicly accessible
- Note connection details

### 3. Deploy to Vercel

#### Via Vercel Dashboard (Easiest)

1. **Go to vercel.com** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project:**
   - Framework Preset: `Other`
   - Root Directory: `backend` (if monorepo) or `.` (if backend-only)
   - Build Command: Leave empty
   - Output Directory: Leave empty

5. **Add Environment Variables** (Click "Environment Variables"):
   ```
   DB_HOST = your-database-host.com
   DB_USER = your-database-username
   DB_PASSWORD = your-database-password
   DB_NAME = vibebox
   ```

6. **Click "Deploy"** 🚀

#### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to:
# - Link to project
# - Set environment variables
# - Deploy
```

### 4. Verify Deployment

Once deployed, Vercel gives you a URL like: `https://vibebox-backend.vercel.app`

Test your endpoints:
```bash
# Test popular tracks
curl https://your-app.vercel.app/api/tracks/popular

# Test search
curl https://your-app.vercel.app/api/search?q=Hindi
```

### 5. Update Frontend

Update your frontend `api.js` to use the Vercel URL:
```javascript
const API_BASE_URL = 'https://your-app.vercel.app';
```

## Configuration Files Created

✅ **vercel.json** - Vercel configuration
- Routes all requests to serverless function
- Sets Node.js environment

✅ **api/index.js** - Serverless wrapper
- Exports Express app for Vercel

✅ **server.js** - Updated for dual mode
- Exports app for Vercel
- Still works locally with `npm start`

## Environment Variables Needed

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `mysql.railway.internal` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_NAME` | Database name | `vibebox` |

## Troubleshooting

### Error: "Cannot connect to database"
- Check environment variables are set correctly
- Ensure database allows external connections
- Verify database host/credentials

### Error: "Function timeout"
- Saavn API might be slow
- Vercel free tier has 10s timeout
- Upgrade to Pro for 60s timeout

### Error: "Module not found"
- Make sure all dependencies are in `package.json`
- Vercel installs from `package.json`

## Testing Locally with Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Run local Vercel environment
vercel dev

# Your app runs at http://localhost:3000
```

## Production Considerations

### Database Connection Pooling
- Serverless creates new connections frequently
- Current setup uses connection pooling (good!)
- Consider connection limits on database

### Cold Starts
- First request after inactivity might be slow
- Vercel warms up functions with traffic

### Monitoring
- Check Vercel dashboard for:
  - Function invocations
  - Errors
  - Response times

## Continuous Deployment

Once connected to GitHub:
- Push to `main` branch → Auto-deploys
- Preview deployments for pull requests
- Rollback with one click

## Cost

**Vercel Free Tier includes:**
- 100 GB bandwidth
- Serverless function executions
- Automatic HTTPS
- Global CDN

Perfect for development and small projects!

## Next Steps

1. ✅ Deploy to Vercel
2. Set up custom domain (optional)
3. Configure CORS if needed
4. Add monitoring/analytics
5. Set up staging environment

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Vercel Discord: https://vercel.com/discord
