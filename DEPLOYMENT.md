# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (for frontend)
- Heroku account (for backend)
- MongoDB Atlas account (for database)

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Whitelist your IP address

## Step 2: Deploy Backend to Heroku

1. **Install Heroku CLI**
   \`\`\`bash
   npm install -g heroku
   \`\`\`

2. **Login to Heroku**
   \`\`\`bash
   heroku login
   \`\`\`

3. **Create Heroku app**
   \`\`\`bash
   heroku create your-dating-app-backend
   \`\`\`

4. **Set environment variables**
   \`\`\`bash
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   heroku config:set JWT_SECRET=your-random-secret-key
   heroku config:set CLIENT_URL=https://your-frontend-url.vercel.app
   \`\`\`

5. **Deploy**
   \`\`\`bash
   git push heroku main
   \`\`\`

6. **View logs**
   \`\`\`bash
   heroku logs --tail
   \`\`\`

## Step 3: Deploy Frontend to Vercel

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   - Add `NEXT_PUBLIC_API_URL` = `https://your-backend-url.herokuapp.com`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

## Step 4: Verify Deployment

1. **Test backend**
   \`\`\`bash
   curl https://your-backend-url.herokuapp.com/api/health
   \`\`\`

2. **Test frontend**
   - Visit your Vercel URL
   - Try registering a new account
   - Test the full flow

## Troubleshooting

### Backend not connecting to MongoDB
- Check MongoDB Atlas whitelist includes Heroku IP
- Verify connection string is correct
- Check environment variables are set

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS is enabled on backend
- Ensure backend is running

### Images not loading
- Verify image URLs are accessible
- Check CORS headers on backend
- Ensure images are properly encoded

## Monitoring

### Heroku
- View logs: `heroku logs --tail`
- Monitor performance: Heroku dashboard
- Set up alerts for errors

### Vercel
- Check deployment status
- View analytics
- Monitor performance metrics

## Scaling

### Database
- Upgrade MongoDB Atlas tier for more storage
- Enable auto-scaling for connections

### Backend
- Upgrade Heroku dyno type
- Enable horizontal scaling with multiple dynos

### Frontend
- Vercel automatically scales
- Monitor bandwidth usage

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable HTTPS on all endpoints
- [ ] Set up CORS properly
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API
- [ ] Set up monitoring and alerts
- [ ] Regular security audits

## Maintenance

- Monitor error logs regularly
- Update dependencies monthly
- Backup database regularly
- Test disaster recovery procedures
- Review security logs
