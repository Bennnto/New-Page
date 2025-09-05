#!/bin/bash

echo "🚀 Page Project - Vercel Deployment (FREE)"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Vercel offers FREE deployment without payment verification!${NC}"
echo ""
echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo "1. GitHub account (to connect your repository)"
echo "2. Vercel account (free at vercel.com)"
echo ""

# Install Vercel CLI
echo -e "${BLUE}📦 Installing Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    if command -v npm &> /dev/null; then
        npm install -g vercel
    else
        echo -e "${YELLOW}⚠️  Please install Node.js first, then run: npm install -g vercel${NC}"
        echo "Or visit: https://vercel.com/cli"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Vercel CLI ready${NC}"

# Create vercel.json configuration
echo -e "${BLUE}📝 Creating vercel.json configuration...${NC}"

cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

echo -e "${GREEN}✅ vercel.json created${NC}"

# Login to Vercel
echo -e "${BLUE}🔐 Please login to Vercel...${NC}"
vercel login

# MongoDB Atlas Configuration
echo -e "${BLUE}🗄️  MongoDB Atlas Configuration${NC}"
echo "Your MongoDB connection details:"
echo "  Host: cluster0.6ho2dzi.mongodb.net"
echo "  Username: benpromkaew_db_user"
echo ""
echo -e "${YELLOW}📋 Please enter your MongoDB Atlas password:${NC}"
read -s MONGODB_PASSWORD

if [ -z "$MONGODB_PASSWORD" ]; then
    echo -e "${RED}❌ MongoDB password is required${NC}"
    exit 1
fi

# Construct MongoDB URI
MONGODB_URI="mongodb+srv://benpromkaew_db_user:$MONGODB_PASSWORD@cluster0.6ho2dzi.mongodb.net/pageproject?retryWrites=true&w=majority"

# Set environment variables
echo -e "${BLUE}🔧 Setting up environment variables...${NC}"

# Create .env.production file for Vercel
cat > .env.production << EOF
MONGODB_URI=$MONGODB_URI
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
NODE_ENV=production
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf
EOF

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
vercel --prod

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📱 Your app is now live!${NC}"
echo ""
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo "   vercel logs                     (view logs)"
echo "   vercel --prod                   (redeploy)"
echo "   vercel env ls                   (view environment variables)"
echo ""

echo -e "${GREEN}✅ Vercel deployment completed!${NC}"
