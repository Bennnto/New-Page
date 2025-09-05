#!/bin/bash

echo "🚀 Page Project - Railway Deployment (FREE)"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Railway offers FREE deployment without payment verification!${NC}"
echo ""
echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo "1. GitHub account (to connect your repository)"
echo "2. Railway account (free at railway.app)"
echo ""

# Install Railway CLI
echo -e "${BLUE}📦 Installing Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    if command -v npm &> /dev/null; then
        npm install -g @railway/cli
    else
        echo -e "${YELLOW}⚠️  Please install Node.js first, then run: npm install -g @railway/cli${NC}"
        echo "Or visit: https://railway.app/cli"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Railway CLI ready${NC}"

# Login to Railway
echo -e "${BLUE}🔐 Please login to Railway...${NC}"
railway login

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

# Create Railway project
echo -e "${BLUE}🏗️  Creating Railway project...${NC}"
railway init

# Set environment variables
echo -e "${BLUE}🔧 Setting up environment variables...${NC}"

# MongoDB Atlas URI
railway variables set MONGODB_URI="$MONGODB_URI"
echo -e "${GREEN}✅ MongoDB Atlas URI configured${NC}"

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
railway variables set JWT_SECRET="$JWT_SECRET"
echo -e "${GREEN}✅ JWT Secret generated and set${NC}"

# Set application environment variables
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set MAX_FILE_SIZE="52428800"
railway variables set ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf"

# Get Railway domain (will be available after deployment)
echo -e "${BLUE}📝 Setting up client URL...${NC}"
railway variables set CLIENT_URL="https://\${{RAILWAY_PUBLIC_DOMAIN}}"

echo -e "${GREEN}✅ Core environment variables set${NC}"

# Deploy to Railway
echo -e "${BLUE}🚀 Deploying to Railway...${NC}"
railway up

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📱 Your app will be available at:${NC}"
echo "   Check Railway dashboard for the generated URL"
echo ""
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo "   railway logs                    (view logs)"
echo "   railway open                    (open app in browser)"
echo "   railway variables               (view environment variables)"
echo "   railway status                  (check deployment status)"
echo ""

echo -e "${GREEN}✅ Railway deployment completed!${NC}"
