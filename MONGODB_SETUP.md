# 🗄️ MongoDB Atlas Setup Guide

## ✅ Step 1: Get Your Connection String

Your connection string should look like this:
```
mongodb+srv://benpromkaew_db_user:YOUR_PASSWORD@cluster0.6ho2dzi.mongodb.net/undercovered?retryWrites=true&w=majority
```

**Replace `YOUR_PASSWORD` with your actual database user password.**

## 🚀 Step 2: Add to Vercel Environment Variables

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Click on your project** (ben-uncovered or similar)
3. **Go to Settings** → **Environment Variables**
4. **Add new variable**:
   - **Name**: `MONGODB_URI`
   - **Value**: Your complete connection string from above
   - **Environment**: Select **All** (Production, Preview, Development)
5. **Click "Save"**

## 🔧 Step 3: Redeploy

After adding the environment variable:
1. **Go to Deployments** tab in Vercel
2. **Click "Redeploy"** on the latest deployment
3. **OR** push any small change to trigger auto-deployment

## ✨ What This Fixes

Once deployed with MongoDB:
- ✅ **Contact form submissions persist forever** (no more lost data!)
- ✅ **Admin panel shows all submissions**
- ✅ **User accounts stored in database**
- ✅ **Website content management works**
- ✅ **All data survives serverless function restarts**

## 🔍 Testing

After deployment, test by:
1. **Submitting a contact form**
2. **Login as admin** (admin@undercovered.com / admin123456)
3. **Check Admin Panel** → **User Requests**
4. **Form submissions should now appear!** 🎉

## 📧 Default Admin Login

- **Email**: admin@undercovered.com
- **Password**: admin123456

## 🆘 Troubleshooting

If you get connection errors:
1. **Check your MongoDB Atlas IP whitelist** (should include 0.0.0.0/0)
2. **Verify your database user password**
3. **Check Vercel logs** for connection errors
4. **Make sure environment variable name is exactly**: `MONGODB_URI`

---

**Need help?** Share any errors you see and I'll help troubleshoot! 🚀
