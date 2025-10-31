# Docker + Fly.io Deployment - Quick Start Guide

## What You Need Before Starting

1. **Docker Desktop** - Download from [docker.com](https://www.docker.com/products/docker-desktop)
2. **Flyctl CLI** - Download from [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl/)
3. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
4. **Fly.io Account** - Sign up at [fly.io](https://fly.io)
5. **Your code pushed to GitHub**

---

## Step 1: Test Locally with Docker (5 minutes)

### 1.1 Build and run everything locally

\`\`\`bash

# Navigate to your project root directory

cd dating-app

# Build all services (MongoDB, Backend, Frontend)

docker-compose build

# Start all services

docker-compose up
\`\`\`

### 1.2 Verify services are running

Open your browser and visit:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

If you see responses, everything works locally!

### 1.3 Stop services

\`\`\`bash

# Press Ctrl+C in the terminal

# Or in another terminal run:

docker-compose down
\`\`\`

---

## Step 2: Setup MongoDB Atlas (10 minutes)

### 2.1 Create a MongoDB database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Create a new project** → name it "dating-app"
3. Click **Create a Deployment** → choose **Free** (M0)
4. Select your region (pick closest to you)
5. Click **Create Deployment** and wait 2-3 minutes

### 2.2 Create database user

1. In the left menu, click **Database Access**
2. Click **Add New Database User**
3. Set username: `dating_app`
4. Set password: `StrongPassword123!` (save this!)
5. Click **Add User**

### 2.3 Whitelist all IPs

1. Click **Network Access** in the left menu
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (enter `0.0.0.0/0`)
4. Click **Confirm**

### 2.4 Get connection string

1. Click **Databases** in the left menu
2. Click **Connect** on your cluster
3. Choose **Drivers** → **Node.js**
4. Copy the connection string (looks like):
   \`\`\`
   mongodb+srv://dating_app:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   \`\`\`
5. Replace `<password>` with your actual password
6. Change the database name at the end: `.../dating-app`

**Your final connection string should be:**
\`\`\`
mongodb+srv://dating_app:StrongPassword123!@cluster0.xxxxx.mongodb.net/dating-app?retryWrites=true&w=majority
\`\`\`

Save this! You'll need it soon.

---

## Step 3: Deploy Backend to Fly.io (10 minutes)

### 3.1 Login to Fly.io

\`\`\`bash
flyctl auth login
\`\`\`

This opens a browser to authenticate. Follow the prompts.

### 3.2 Create backend app

\`\`\`bash

# Create fly.toml for backend

cp fly.toml.backend fly.toml

# Create the app on Fly.io

flyctl launch --no-deploy
\`\`\`

When prompted:

- **App name**: Enter something like `dating-app-backend` (must be unique)
- **Region**: Choose closest to you (e.g., sfo, iad, lhr)
- **Dockerfile**: Say "Yes" when asked to use Dockerfile
- For other prompts, just press Enter to use defaults

### 3.3 Set environment variables

\`\`\`bash

# Replace the values with your actual MongoDB connection string and generate a random JWT secret

flyctl secrets set \
 MONGODB_URI="mongodb+srv://dating_app:StrongPassword123!@cluster0.xxxxx.mongodb.net/dating-app?retryWrites=true&w=majority" \
 JWT_SECRET="your-super-secret-key-change-this" \
 CLIENT_URL="https://dating-app-frontend.fly.dev"

# Note: We'll update CLIENT_URL after frontend is deployed

\`\`\`

### 3.4 Deploy backend

\`\`\`bash
flyctl deploy
\`\`\`

Wait 2-3 minutes for deployment to complete.

### 3.5 Get your backend URL

\`\`\`bash
flyctl info
\`\`\`

Look for the URL line. It should show: `https://dating-app-backend.fly.dev`

Save this! You'll need it for frontend deployment.

### 3.6 Verify backend is working

\`\`\`bash

# Test health endpoint

curl https://dating-app-backend.fly.dev/api/health

# Should return: {"status":"ok"}

\`\`\`

---

## Step 4: Deploy Frontend to Fly.io (10 minutes)

### 4.1 Create frontend app

\`\`\`bash

# Copy frontend config

cp fly.toml.frontend fly.toml

# Create the app on Fly.io

flyctl launch --no-deploy
\`\`\`

When prompted:

- **App name**: Enter something like `dating-app-frontend` (must be unique)
- **Region**: Same as backend region
- **Dockerfile**: Say "Yes"
- For other prompts, press Enter

### 4.2 Set environment variables

\`\`\`bash

# Replace YOUR-BACKEND-URL with your actual backend URL from Step 3.5

flyctl secrets set \
 NEXT_PUBLIC_API_URL="https://dating-app-backend.fly.dev"
\`\`\`

### 4.3 Deploy frontend

\`\`\`bash
flyctl deploy
\`\`\`

Wait 2-3 minutes for deployment to complete.

### 4.4 Get your frontend URL

\`\`\`bash
flyctl info
\`\`\`

Your frontend URL will be shown. Should be: `https://dating-app-frontend.fly.dev`

---

## Step 5: Update Backend with Frontend URL (2 minutes)

### 5.1 Update CLIENT_URL

\`\`\`bash

# Set the correct frontend URL in backend

flyctl secrets set \
 -a dating-app-backend \
 CLIENT_URL="https://dating-app-frontend.fly.dev"

# Redeploy backend with updated URL

flyctl deploy -a dating-app-backend
\`\`\`

---

## Step 6: Test Your Live App (5 minutes)

### 6.1 Open your app

Visit: `https://dating-app-frontend.fly.dev`

### 6.2 Test the features

1. **Register**: Create a new account
2. **Login**: Log in with your credentials
3. **Discover**: Swipe right/left on profiles
4. **Messaging**: Verify chat works

### 6.3 Monitor in real-time

\`\`\`bash

# Watch backend logs

flyctl logs -a dating-app-backend --follow

# In another terminal, watch frontend logs

flyctl logs -a dating-app-frontend --follow

# Test registration to see logs in action

\`\`\`

---

## Troubleshooting

### Problem: "Can't connect to database"

**Solution**: Verify MongoDB connection string

\`\`\`bash

# Check secrets are correct

flyctl secrets list -a dating-app-backend

# Verify format: mongodb+srv://username:password@cluster/database

# Make sure password is URL-encoded if it contains special characters

\`\`\`

### Problem: "Frontend can't reach backend"

**Solution**: Check API URL

\`\`\`bash

# Check frontend secrets

flyctl secrets list -a dating-app-frontend

# Verify NEXT_PUBLIC_API_URL matches your backend URL exactly

# Should be: https://dating-app-backend.fly.dev

\`\`\`

### Problem: "Deployment failed"

**Solution**: Check logs

\`\`\`bash

# View full deployment logs

flyctl logs -a dating-app-backend

# Check for errors

# Common issues: missing environment variables, Docker build errors

\`\`\`

### Problem: "Can't login to Fly.io"

**Solution**: Reinstall flyctl

\`\`\`bash

# Uninstall

# macOS: brew uninstall flyctl

# Linux: rm /usr/local/bin/flyctl

# Windows: winget uninstall superfly.flyctl

# Reinstall from: https://fly.io/docs/hands-on/install-flyctl/

# Try login again

flyctl auth login
\`\`\`

---

## Quick Commands Reference

\`\`\`bash

# Deployment

flyctl deploy -a dating-app-backend # Redeploy backend
flyctl deploy -a dating-app-frontend # Redeploy frontend

# Secrets (environment variables)

flyctl secrets list -a dating-app-backend # View all secrets
flyctl secrets set VAR=value -a dating-app-backend # Add/update secret
flyctl secrets unset VAR -a dating-app-backend # Remove secret

# Monitoring

flyctl logs -a dating-app-backend --follow # Watch logs in real-time
flyctl status -a dating-app-backend # Check app status
flyctl info -a dating-app-backend # Get app info (URL, etc.)

# Scaling

flyctl scale count 2 -a dating-app-backend # Scale to 2 instances
flyctl scale show -a dating-app-backend # View current scale

# Other

flyctl open -a dating-app-frontend # Open app in browser
flyctl destroy -a dating-app-backend # Delete app
\`\`\`

---

## You're Done!

Your dating app is now live on Fly.io!

- **Frontend**: https://dating-app-frontend.fly.dev
- **Backend API**: https://dating-app-backend.fly.dev
- **Database**: MongoDB Atlas

### Next Steps (Optional)

1. **Add custom domain**: Follow [Fly.io custom domain guide](https://fly.io/docs/networking/custom-domain/)
2. **Setup monitoring**: Visit your Fly.io dashboard to view metrics
3. **Enable auto-scaling**: Configure machine count rules in Fly.io dashboard
4. **Setup backups**: Enable automated backups in MongoDB Atlas settings

---

## Need Help?

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io
- MongoDB Atlas Docs: https://docs.mongodb.com/atlas/
- Dating App Issues: Check TECHNICAL_LIMITATIONS.md for known issues
