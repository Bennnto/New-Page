#!/bin/bash

echo "🚀 Page Project - MongoDB Atlas Heroku Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found!${NC}"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Heroku first: heroku login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Heroku CLI ready${NC}"

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

# Get app name from user
echo -e "${BLUE}📝 Enter your Heroku app name (or press Enter for auto-generated):${NC}"
read -r APP_NAME

# Create Heroku app
if [ -z "$APP_NAME" ]; then
    echo -e "${BLUE}🏗️  Creating Heroku app with auto-generated name...${NC}"
    heroku create
else
    echo -e "${BLUE}🏗️  Creating Heroku app: $APP_NAME${NC}"
    heroku create "$APP_NAME"
fi

# Get the actual app name (in case it was auto-generated)
ACTUAL_APP_NAME=$(heroku apps:info --json | jq -r .app.name 2>/dev/null || heroku apps:info | grep "=== " | awk '{print $2}')
echo -e "${GREEN}✅ App created: $ACTUAL_APP_NAME${NC}"

# Set environment variables
echo -e "${BLUE}🔧 Setting up environment variables...${NC}"

# MongoDB Atlas URI
heroku config:set MONGODB_URI="$MONGODB_URI"
echo -e "${GREEN}✅ MongoDB Atlas URI configured${NC}"

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
heroku config:set JWT_SECRET="$JWT_SECRET"
echo -e "${GREEN}✅ JWT Secret generated and set${NC}"

# Set application environment variables
heroku config:set NODE_ENV="production"
heroku config:set CLIENT_URL="https://$ACTUAL_APP_NAME.herokuapp.com"
heroku config:set MAX_FILE_SIZE="52428800"
heroku config:set ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf"

echo -e "${GREEN}✅ Core environment variables set${NC}"

# Stripe Configuration (optional for now)
echo -e "${BLUE}💳 Do you want to configure Stripe for payments? (y/n):${NC}"
read -r SETUP_STRIPE

if [[ "$SETUP_STRIPE" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Enter your Stripe Secret Key (sk_test_...):"
    read -r STRIPE_SECRET_KEY
    echo "Enter your Stripe Publishable Key (pk_test_...):"
    read -r STRIPE_PUBLISHABLE_KEY
    
    if [ -n "$STRIPE_SECRET_KEY" ] && [ -n "$STRIPE_PUBLISHABLE_KEY" ]; then
        heroku config:set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
        heroku config:set STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY"
        echo -e "${GREEN}✅ Stripe configuration set${NC}"
    fi
fi

# Deploy to Heroku
echo -e "${BLUE}🚀 Deploying to Heroku...${NC}"
git push heroku main

# Check deployment status
echo -e "${BLUE}🔍 Checking deployment status...${NC}"
heroku ps

# Scale web dyno
heroku ps:scale web=1

# Show logs
echo -e "${BLUE}📋 Recent deployment logs:${NC}"
heroku logs --tail --num=20

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📱 Your app is available at:${NC}"
echo "   https://$ACTUAL_APP_NAME.herokuapp.com"
echo ""
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo "   heroku logs --tail               (view live logs)"
echo "   heroku open                     (open app in browser)"
echo "   heroku config                   (view environment variables)"
echo "   heroku restart                  (restart app)"
echo ""

# Ask if user wants to open the app
echo -e "${BLUE}🌐 Open the app in your browser? (y/n):${NC}"
read -r OPEN_APP

if [[ "$OPEN_APP" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    heroku open
fi

echo -e "${GREEN}✅ MongoDB Atlas deployment completed!${NC}"
