# 🚀 Quick MongoDB Atlas Deployment Guide

## Your MongoDB Details
- **Connection String**: `mongodb+srv://cluster0.6ho2dzi.mongodb.net/`
- **Username**: `benpromkaew_db_user`
- **Host**: `cluster0.6ho2dzi.mongodb.net`

## 📋 Steps to Deploy

### 1. Verify Heroku Account
1. Go to: https://heroku.com/verify
2. Add a credit card (free tier still applies)
3. Verify your account

### 2. Prepare MongoDB Atlas
1. Make sure your MongoDB Atlas cluster is running
2. Ensure your database user `benpromkaew_db_user` has readWrite permissions
3. Have your database password ready
4. Whitelist `0.0.0.0/0` in Network Access (for Heroku)

### 3. Deploy to Heroku
```bash
cd "/Users/benpromkaew/Page/Page Project"
./deploy-with-mongodb.sh
```

The script will:
- ✅ Create a Heroku app
- ✅ Configure MongoDB Atlas connection automatically
- ✅ Generate secure JWT secret
- ✅ Set up all environment variables
- ✅ Deploy your application
- ✅ Scale the web dyno

### 4. What You'll Need During Deployment
- Your MongoDB Atlas password
- Desired Heroku app name (or let it auto-generate)
- Stripe keys (optional, can be added later)

## 🔧 Environment Variables Set Automatically

The script will configure:
```bash
MONGODB_URI=mongodb+srv://benpromkaew_db_user:YOUR_PASSWORD@cluster0.6ho2dzi.mongodb.net/pageproject?retryWrites=true&w=majority
JWT_SECRET=automatically_generated_64_character_secret
NODE_ENV=production
CLIENT_URL=https://your-app-name.herokuapp.com
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf
```

## 🎯 After Deployment

Your Page Project will be live at:
- **URL**: `https://your-app-name.herokuapp.com`
- **API**: `https://your-app-name.herokuapp.com/api`

## 🛠️ Useful Commands

```bash
# View live logs
heroku logs --tail

# Open app in browser
heroku open

# Check app status
heroku ps

# View environment variables
heroku config

# Restart app
heroku restart

# Scale dynos
heroku ps:scale web=1
```

## 🚨 If Deployment Fails

1. Check logs: `heroku logs --tail`
2. Verify MongoDB password is correct
3. Ensure MongoDB Atlas allows connections from `0.0.0.0/0`
4. Check if all environment variables are set: `heroku config`

## 💡 Notes

- Your app will be on Heroku's free tier (sleeps after 30 minutes of inactivity)
- MongoDB Atlas free tier provides 512MB storage
- All files are ready for deployment - no additional setup needed
- Frontend builds automatically during deployment
