# 🚀 Page Project Setup Guide

Your Page Project is ready! Follow these steps to get it running:

## Option 1: Quick Setup with MongoDB Atlas (Recommended)

### Step 1: Set up MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster (choose the free tier)
4. Create a database user (username/password)
5. Get your connection string

### Step 2: Update Environment Variables
Edit the `.env` file in your project root:

```bash
# Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pageproject?retryWrites=true&w=majority

# Other required variables
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Optional: Stripe keys (for payment features)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Step 3: Frontend Environment
Create `client/.env`:
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd "Page Project"
npm start
```

**Terminal 2 - Frontend:**
```bash
cd "Page Project/client"
npm start
```

## Option 2: Local MongoDB Setup

If you prefer local MongoDB, install it first:
```bash
# Install MongoDB locally
brew tap mongodb/brew
brew install mongodb-community@8.0

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

Then follow steps 2-4 above (keep the default MONGODB_URI).

## 🎉 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Features Available

✅ **User Authentication** - Register/Login
✅ **Media Upload** - Drag & drop file uploads  
✅ **Media Gallery** - Browse and view media
✅ **User Dashboard** - Statistics and management
✅ **Payment System** - Stripe integration (requires API keys)
✅ **Announcements** - Admin announcements
✅ **Dark Theme** - Eye-friendly design

## 🆘 Troubleshooting

### "Database connection error"
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify username/password in connection string

### "Frontend won't start"
- Run `cd client && npm install --legacy-peer-deps`
- Check that port 3000 is available

### "TypeScript errors"
- All TypeScript errors have been fixed
- If issues persist, try `cd client && rm -rf node_modules && npm install --legacy-peer-deps`

## 📞 Need Help?

The project is fully functional with all requested features:
- Payment system integration ✅
- Media upload functionality ✅  
- User-side media display ✅
- Session management ✅
- Modern dark UI ✅

Ready to use immediately once database is connected!
