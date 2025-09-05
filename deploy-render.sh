#!/bin/bash

echo "🚀 Page Project - Render Deployment (FREE)"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Render offers FREE deployment without payment verification!${NC}"
echo ""
echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo "1. GitHub account (to connect your repository)"
echo "2. Render account (free at render.com)"
echo ""

# Create render.yaml for automatic deployment
echo -e "${BLUE}📝 Creating render.yaml configuration...${NC}"

cat > render.yaml << 'EOF'
services:
  - type: web
    name: page-project
    env: node
    plan: free
    buildCommand: cd client && npm install && npm run build
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: MAX_FILE_SIZE
        value: 52428800
      - key: ALLOWED_FILE_TYPES
        value: image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf
      - key: CLIENT_URL
        value: https://page-project.onrender.com
EOF

echo -e "${GREEN}✅ render.yaml created${NC}"

# Create instructions file
cat > RENDER_DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# 🚀 Render Deployment Instructions (FREE)

## Step 1: Prepare Repository
1. Commit and push all changes to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

## Step 2: Connect to Render
1. Go to https://render.com
2. Sign up with your GitHub account (FREE)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

## Step 3: Configure Deployment
1. **Repository**: Select your Page Project repository
2. **Name**: page-project (or your preferred name)
3. **Environment**: Node
4. **Build Command**: `cd client && npm install && npm run build`
5. **Start Command**: `node server.js`

## Step 4: Set Environment Variables
In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://benpromkaew_db_user:YOUR_PASSWORD@cluster0.6ho2dzi.mongodb.net/pageproject?retryWrites=true&w=majority
JWT_SECRET=your_generated_secret_here
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf
CLIENT_URL=https://your-app-name.onrender.com
```

## Step 5: Deploy
1. Click "Create Web Service"
2. Render will automatically deploy from your GitHub repository
3. Your app will be live at: `https://your-app-name.onrender.com`

## 🎯 Free Tier Limits
- ✅ No payment verification required
- ✅ 750 hours/month (essentially unlimited for personal use)
- ✅ Automatic SSL certificates
- ✅ Custom domains supported
- ⚠️ Spins down after 15 minutes of inactivity (cold starts)

## 🔄 Automatic Deployments
- Every push to your GitHub main branch automatically deploys
- No manual deployment needed after initial setup
EOF

echo -e "${GREEN}✅ Render deployment instructions created${NC}"

echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Push your code to GitHub"
echo "2. Follow instructions in RENDER_DEPLOYMENT_INSTRUCTIONS.md"
echo "3. Your app will be live on Render (FREE)!"
echo ""

echo -e "${GREEN}✅ Render deployment preparation completed!${NC}"
