# Heroku + Vercel Deployment Guide

## What You Need Before Starting

1. **Heroku Account** - Sign up at [heroku.com](https://www.heroku.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Heroku CLI** - Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)
4. **Git** - Already installed if you have Node.js
5. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
6. **GitHub Repository** - Push your code to GitHub

---

## Step 1: Setup MongoDB Atlas (10 minutes)

### 1.1 Create a MongoDB database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Create a new project** → name it "dating-app"
3. Click **Create a Deployment** → choose **Free** (M0)
4. Select your region (pick closest to you)
5. Click **Create Deployment** and wait 2-3 minutes

### 1.2 Create database user

1. In the left menu, click **Database Access**
2. Click **Add New Database User**
3. Set username: `dating_app`
4. Set password: `StrongPassword123!` (save this!)
5. Click **Add User**

### 1.3 Whitelist all IPs

1. Click **Network Access** in the left menu
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (enter `0.0.0.0/0`)
4. Click **Confirm**

### 1.4 Get connection string

1. Click **Databases** in the left menu
2. Click **Connect** on your cluster
3. Choose **Drivers** → **Node.js**
4. Copy the connection string

**Your final connection string:**
mongodb+srv://ashmilana_db_user:<db_password>@nexus.vufxhab.mongodb.net/?appName=Nexus

Save this! You'll need it soon.

---

## Step 2: Deploy Backend to Heroku (15 minutes)

### 2.1 Login to Heroku

\`\`\`bash
heroku login
\`\`\`

This opens a browser to authenticate. Follow the prompts.

### 2.2 Create Heroku app

\`\`\`bash

# Navigate to your project root

cd dating-app

# Create a new Heroku app

heroku create dating-app-backend
\`\`\`

You'll get output like:
\`\`\`
Creating ⬢ dating-app-backend... done
https://dating-app-backend.herokuapp.com/ | https://git.heroku.com/dating-app-backend.git
\`\`\`

Save the URL: 'https://nexus-backend-2025-8f15d2721b87.herokuapp.com/' | 'https://git.heroku.com/nexus-backend-2025.git'

### 2.3 Set environment variables

\`\`\`bash

# Set all required environment variables

heroku config:set \
 MONGODB_URI="mongodb+srv://ashmilana_db_user:<AnoNyMous0814>@nexus.vufxhab.mongodb.net/?appName=Nexus" \
 JWT_SECRET="your-random-secret-key-min-32-chars-change-me" \
 CLIENT_URL="http://localhost:3000/" \
 NODE_ENV="development" \
 -a nexus-backend-2025
\`\`\`

Replace the values with your actual MongoDB connection string and a random JWT secret.

### 2.4 Deploy backend

\`\`\`bash

# Add Heroku remote and push code

git push heroku main

# Watch deployment logs

heroku logs --tail -a dating-app-backend
\`\`\`

Wait 3-5 minutes for deployment to complete.

### 2.5 Verify backend is working

\`\`\`bash

# Test health endpoint

curl https://dating-app-backend.herokuapp.com/api/health

# Should return: {"status":"OK","timestamp":"..."}

\`\`\`

---

## Step 3: Deploy Frontend to Vercel (10 minutes)

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Click **Import Git Repository**
4. Search for your dating-app repository
5. Click **Import**

### 3.2 Configure environment variables

1. In the **Environment Variables** section, add:

\`\`\`
NEXT_PUBLIC_API_URL = https://dating-app-backend.herokuapp.com
\`\`\`

2. Click **Add** for each variable

### 3.3 Deploy frontend

1. Click **Deploy**
2. Wait 3-5 minutes for build to complete
3. You'll see: **Congratulations! Your site is live**

Your frontend URL will be: `https://your-project.vercel.app`

### 3.4 Verify frontend is working

Visit: `https://your-project.vercel.app`

You should see the dating app landing page.

---

## Step 4: Update Backend with Frontend URL (2 minutes)

### 4.1 Update CLIENT_URL

\`\`\`bash

# Set the correct frontend URL in backend

heroku config:set \
 CLIENT_URL="https://your-project.vercel.app" \
 -a dating-app-backend

# Redeploy backend

git push heroku main
\`\`\`

---

## Step 5: Test Your Live App (5 minutes)

### 5.1 Register and login

1. Visit `https://your-project.vercel.app`
2. Click **Register**
3. Create an account with email, name, age, bio, and profile picture
4. Login with your credentials

### 5.2 Test core features

1. **Discover**: Swipe right/left on profiles
2. **Matches**: View your matches
3. **Chat**: Send messages to matches

### 5.3 Monitor logs

\`\`\`bash

# Watch backend logs in real-time

heroku logs --tail -a dating-app-backend

# View Vercel logs

# Go to your Vercel project dashboard → Deployments → View Logs

\`\`\`

---

## Troubleshooting

### Problem: "Cannot find module" error on Heroku

**Solution**: Ensure package.json is in root directory

\`\`\`bash

# Check if package.json exists

ls package.json

# If missing, Heroku won't install dependencies

# Move it to root if it's in a subfolder

\`\`\`

### Problem: "MONGODB_URI is not defined"

**Solution**: Check environment variables

\`\`\`bash

# View all set variables

heroku config -a dating-app-backend

# Verify MONGODB_URI is there

# If missing, set it again:

heroku config:set MONGODB_URI="your-connection-string" -a dating-app-backend
\`\`\`

### Problem: "Frontend can't reach backend"

**Solution**: Verify API URL

1. Go to Vercel project settings
2. Check **Environment Variables**
3. Verify `NEXT_PUBLIC_API_URL` is set to `https://dating-app-backend.herokuapp.com`
4. Redeploy if changed

### Problem: "Deployment failed on Heroku"

**Solution**: Check build logs

\`\`\`bash

# View full deployment logs

heroku logs --source app --tail -a dating-app-backend

# Common issues:

# - Missing environment variables

# - Node version incompatibility

# - Port not being used correctly

\`\`\`

### Problem: "Vercel build fails"

**Solution**: Check Next.js build

1. Go to Vercel dashboard
2. Click **Deployments**
3. Click failed deployment
4. View logs for errors
5. Common causes: missing env vars, invalid Next.js config

### Problem: "Port already in use" error

**Solution**: Let Heroku assign the port

The app already uses `process.env.PORT` which Heroku sets automatically. No changes needed.

---

## Quick Commands Reference

\`\`\`bash

# Heroku Backend

# Deployment

git push heroku main # Deploy latest code
heroku logs -a dating-app-backend # View logs
heroku restart -a dating-app-backend # Restart app

# Environment Variables

heroku config -a dating-app-backend # View all env vars
heroku config:set KEY=value -a dating-app-backend # Set env var
heroku config:unset KEY -a dating-app-backend # Remove env var

# Scaling

heroku ps:scale web=1 -a dating-app-backend # Scale to 1 dyno
heroku ps -a dating-app-backend # View running processes

# Database

heroku config:get MONGODB_URI -a dating-app-backend # Get DB connection string

# Other

heroku open -a dating-app-backend # Open app in browser
heroku destroy -a dating-app-backend # Delete app

# Vercel Frontend

# Deployment

vercel # Deploy to Vercel
vercel --prod # Deploy to production

# Environment Variables

vercel env pull # Pull env vars locally
vercel env add # Add new env var

# View Logs

# Dashboard → Deployments → View Logs

\`\`\`

---

## Scaling for Production

### Heroku Backend Scaling

\`\`\`bash

# View current dyno type

heroku ps -a dating-app-backend

# Scale to larger dyno (costs $7-50/month)

heroku dyno:type standard-1x -a dating-app-backend

# Or use eco dyno (free tier, limited)

heroku dyno:type eco -a dating-app-backend
\`\`\`

### Vercel Frontend Scaling

Vercel automatically scales your frontend. No action needed!

### MongoDB Atlas Scaling

If you need more storage/performance:

1. Go to MongoDB Atlas dashboard
2. Click **Billing** → **Change Cluster Tier**
3. Upgrade from M0 (free) to M2, M5, etc.
4. Takes about 5-10 minutes to apply

---

## Custom Domain Setup

### Add custom domain to Heroku

\`\`\`bash

# Add domain to Heroku app

heroku domains:add yourdomain.com -a dating-app-backend

# Get the DNS target

heroku domains -a dating-app-backend

# Add CNAME record in your domain registrar

# Point yourdomain.com to your Heroku DNS target

\`\`\`

### Add custom domain to Vercel

1. Go to Vercel project → Settings → Domains
2. Enter your domain
3. Follow DNS setup instructions
4. Add CNAME or A record to your domain registrar

---

## Cost Estimate (Monthly)

- **Heroku Backend**: Free (eco dyno) or $7+ (standard dyno)
- **Vercel Frontend**: Free (up to 100GB bandwidth)
- **MongoDB Atlas**: Free (512MB storage) or $0.30/GB after

**Total**: Free to $7+/month to start

---

## You're Done!

Your dating app is now live!

- **Frontend**: https://your-project.vercel.app
- **Backend API**: https://dating-app-backend.herokuapp.com
- **Database**: MongoDB Atlas

---

## Continuous Deployment

Your apps now auto-deploy when you push to GitHub!

1. Make changes locally
2. `git add .`
3. `git commit -m "Your message"`
4. `git push origin main`
5. Vercel automatically deploys frontend
6. For backend: `git push heroku main`

---

## Monitoring & Alerts

### Heroku Monitoring

\`\`\`bash

# View metrics

heroku metrics -a dating-app-backend

# View dyno sleeping status

heroku ps -a dating-app-backend

# Get email alerts

# Go to Heroku Dashboard → Settings → Email Notifications

\`\`\`

### Vercel Monitoring

1. Go to Vercel Dashboard
2. Click your project
3. View Analytics and Deployments
4. Monitor performance metrics

### MongoDB Alerts

1. Go to MongoDB Atlas Dashboard
2. Click **Alerts**
3. Create alert for:
   - CPU usage > 80%
   - Memory usage > 80%
   - Connection count spike

---

## Next Steps (Optional)

1. **Setup monitoring**: Heroku + Vercel dashboards
2. **Add analytics**: Vercel Analytics, MongoDB Atlas metrics
3. **Setup CI/CD**: GitHub Actions for automated testing
4. **Add APM**: Application Performance Monitoring
5. **Custom emails**: SendGrid for password reset emails

---

## Need Help?

- **Heroku Docs**: https://devcenter.heroku.com
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.mongodb.com/atlas/
- **GitHub**: https://docs.github.com
