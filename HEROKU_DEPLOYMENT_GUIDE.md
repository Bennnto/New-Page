# 🚀 Page Project - Heroku Deployment Guide

## 📋 Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **MongoDB Atlas**: Free database at [cloud.mongodb.com](https://cloud.mongodb.com)
4. **Stripe Account**: For payments at [stripe.com](https://stripe.com)

## 🔧 Step 1: Prepare Project for Heroku

### Install Heroku CLI (if not installed)
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Verify installation
heroku --version
```

### Login to Heroku
```bash
heroku login
```

## 🗄️ Step 2: Setup MongoDB Atlas (Free Tier)

1. **Create Account**: Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create Cluster**: Choose free tier (M0)
3. **Create Database User**: Add username/password
4. **Whitelist IP**: Add `0.0.0.0/0` for Heroku access
5. **Get Connection String**: Copy the connection URI

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pageproject?retryWrites=true&w=majority
```

## 💳 Step 3: Setup Stripe

1. **Create Account**: Go to [stripe.com](https://stripe.com)
2. **Get API Keys**: From Dashboard → Developers → API Keys
3. **Copy Keys**:
   - Publishable key: `pk_test_...` (for frontend)
   - Secret key: `sk_test_...` (for backend)

## 🚀 Step 4: Deploy to Heroku

### Create Heroku App
```bash
# Navigate to project directory
cd "/Users/benpromkaew/Page/Page Project"

# Create Heroku app (replace 'your-app-name' with unique name)
heroku create your-page-project-app

# Or let Heroku generate a name
heroku create
```

### Set Environment Variables
```bash
# Database
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pageproject?retryWrites=true&w=majority"

# JWT Secret (generate a strong 64+ character secret)
heroku config:set JWT_SECRET="your_super_secure_jwt_secret_at_least_64_characters_long_for_production"

# Stripe Configuration
heroku config:set STRIPE_SECRET_KEY="sk_test_your_actual_stripe_secret_key"
heroku config:set STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_stripe_publishable_key"
heroku config:set STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Application Settings
heroku config:set NODE_ENV="production"
heroku config:set CLIENT_URL="https://your-app-name.herokuapp.com"

# Email Configuration (optional - for notifications)
heroku config:set EMAIL_HOST="smtp.gmail.com"
heroku config:set EMAIL_PORT="587"
heroku config:set EMAIL_USER="your-email@gmail.com"
heroku config:set EMAIL_PASS="your-app-password"

# File Upload Configuration
heroku config:set MAX_FILE_SIZE="52428800"
heroku config:set ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf"
```

### Deploy the Application
```bash
# Add all files to git
git add .

# Commit changes
git commit -m "Prepare for Heroku deployment"

# Deploy to Heroku
git push heroku main

# If you're on a different branch (like master)
git push heroku master:main
```

## 🔧 Step 5: Post-Deployment Setup

### Open Your App
```bash
# Open the deployed app in browser
heroku open

# Check app status
heroku ps

# View logs
heroku logs --tail
```

### Scale Dynos (if needed)
```bash
# Ensure at least one web dyno is running
heroku ps:scale web=1
```

## 🎯 Step 6: Frontend Deployment

The current setup deploys as a full-stack app. The `heroku-postbuild` script in `package.json` automatically builds the React frontend.

### Verify Frontend Build
```bash
# Check the build process in logs
heroku logs --tail

# The build should show:
# - "cd client && npm install && npm run build"
# - Frontend files copied to client/build/
```

## 🔒 Step 7: Security & Production Optimizations

### SSL/HTTPS
- Heroku provides free SSL certificates
- Your app will be accessible via `https://your-app-name.herokuapp.com`

### Environment Variables Verification
```bash
# Check all environment variables are set
heroku config

# Should show all your configured variables
```

### Database Indexing (Optional)
```bash
# Connect to your MongoDB Atlas and create indexes for better performance
# This can be done through MongoDB Compass or Atlas UI
```

## 🧪 Step 8: Testing the Deployment

### Test All Features:
1. **Visit**: `https://your-app-name.herokuapp.com`
2. **Test Registration/Login**
3. **Test File Uploads**
4. **Test Payment Processing** (with Stripe test cards)
5. **Test Dashboard Features**

### Stripe Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🔧 Step 9: Troubleshooting

### Common Issues:

#### App Won't Start
```bash
# Check logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart app
heroku restart
```

#### Database Connection Issues
```bash
# Verify MongoDB URI
heroku config:get MONGODB_URI

# Test connection from Atlas
# Ensure IP 0.0.0.0/0 is whitelisted
```

#### Build Failures
```bash
# Check if package.json has correct scripts
# Ensure client dependencies install correctly
heroku logs --tail | grep "npm install"
```

## 📊 Step 10: Monitoring & Maintenance

### View App Metrics
```bash
# Open Heroku dashboard
heroku addons:open heroku-postgresql  # if using Postgres instead

# View app metrics in Heroku dashboard
heroku logs --tail
```

### Scaling (if needed)
```bash
# Scale web dynos
heroku ps:scale web=2

# Add worker dynos (for background jobs)
heroku ps:scale worker=1
```

## 💰 Cost Considerations

### Free Tier Limitations:
- **Dynos**: Sleep after 30 minutes of inactivity
- **Hours**: 550-1000 free dyno hours per month
- **Add-ons**: Most require payment

### Upgrade Options:
- **Hobby**: $7/month for always-on dynos
- **Professional**: $25-500/month for production features

## 🎯 Final URLs

After successful deployment:
- **Application**: `https://your-app-name.herokuapp.com`
- **API**: `https://your-app-name.herokuapp.com/api`
- **Admin**: Access through the web interface

## 🔄 Future Updates

To deploy updates:
```bash
# Make changes to code
git add .
git commit -m "Your update message"
git push heroku main
```

## 📞 Support Resources

- **Heroku Docs**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)

---

## ⚡ Quick Deployment Commands Summary

```bash
# 1. Create app
heroku create your-app-name

# 2. Set environment variables (replace with your actual values)
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set JWT_SECRET="your_64_character_secret"
heroku config:set STRIPE_SECRET_KEY="your_stripe_secret"
heroku config:set STRIPE_PUBLISHABLE_KEY="your_stripe_publishable"
heroku config:set NODE_ENV="production"
heroku config:set CLIENT_URL="https://your-app-name.herokuapp.com"

# 3. Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 4. Open app
heroku open
```

🎉 **Your Page Project will be live on Heroku!**
