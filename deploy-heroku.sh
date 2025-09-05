#!/bin/bash

echo "🚀 Page Project - Heroku Deployment Script"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found!${NC}"
    echo "Install it from: https://devcenter.heroku.com/articles/heroku-cli"
    echo "macOS: brew tap heroku/brew && brew install heroku"
    exit 1
fi

echo -e "${GREEN}✅ Heroku CLI found${NC}"

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Heroku...${NC}"
    heroku login
fi

echo -e "${GREEN}✅ Heroku authentication verified${NC}"

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
ACTUAL_APP_NAME=$(heroku apps:info --json | grep -o '"name":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ App created: $ACTUAL_APP_NAME${NC}"

# Set environment variables
echo -e "${BLUE}🔧 Setting up environment variables...${NC}"

echo -e "${YELLOW}📋 You'll need to provide the following:${NC}"
echo "1. MongoDB Atlas connection string"
echo "2. Stripe API keys"
echo "3. JWT Secret (will generate if not provided)"

# MongoDB URI
echo -e "${BLUE}🗄️  Enter your MongoDB Atlas connection string:${NC}"
echo "   Example: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pageproject"
read -r MONGODB_URI

if [ -n "$MONGODB_URI" ]; then
    heroku config:set MONGODB_URI="$MONGODB_URI"
    echo -e "${GREEN}✅ MongoDB URI set${NC}"
fi

# Stripe Secret Key
echo -e "${BLUE}💳 Enter your Stripe Secret Key (sk_test_...):${NC}"
read -r STRIPE_SECRET_KEY

if [ -n "$STRIPE_SECRET_KEY" ]; then
    heroku config:set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
    echo -e "${GREEN}✅ Stripe Secret Key set${NC}"
fi

# Stripe Publishable Key
echo -e "${BLUE}💳 Enter your Stripe Publishable Key (pk_test_...):${NC}"
read -r STRIPE_PUBLISHABLE_KEY

if [ -n "$STRIPE_PUBLISHABLE_KEY" ]; then
    heroku config:set STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY"
    echo -e "${GREEN}✅ Stripe Publishable Key set${NC}"
fi

# JWT Secret
echo -e "${BLUE}🔐 Enter JWT Secret (or press Enter to generate):${NC}"
read -r JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    echo -e "${YELLOW}🔐 Generated JWT Secret${NC}"
fi

heroku config:set JWT_SECRET="$JWT_SECRET"

# Set other required environment variables
heroku config:set NODE_ENV="production"
heroku config:set CLIENT_URL="https://$ACTUAL_APP_NAME.herokuapp.com"
heroku config:set MAX_FILE_SIZE="52428800"
heroku config:set ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,video/mp4,video/webm,application/pdf"

echo -e "${GREEN}✅ All environment variables set${NC}"

# Optional: Email configuration
echo -e "${BLUE}📧 Do you want to configure email notifications? (y/n):${NC}"
read -r SETUP_EMAIL

if [[ "$SETUP_EMAIL" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Enter email host (e.g., smtp.gmail.com):"
    read -r EMAIL_HOST
    echo "Enter email port (e.g., 587):"
    read -r EMAIL_PORT
    echo "Enter email username:"
    read -r EMAIL_USER
    echo "Enter email password/app password:"
    read -r EMAIL_PASS
    
    heroku config:set EMAIL_HOST="$EMAIL_HOST"
    heroku config:set EMAIL_PORT="$EMAIL_PORT"
    heroku config:set EMAIL_USER="$EMAIL_USER"
    heroku config:set EMAIL_PASS="$EMAIL_PASS"
    
    echo -e "${GREEN}✅ Email configuration set${NC}"
fi

# Prepare for deployment
echo -e "${BLUE}📦 Preparing for deployment...${NC}"

# Add all files to git
git add .

# Commit changes
git commit -m "Prepare for Heroku deployment - $(date)"

# Deploy to Heroku
echo -e "${BLUE}🚀 Deploying to Heroku...${NC}"
git push heroku main

# Check deployment status
echo -e "${BLUE}🔍 Checking deployment status...${NC}"
heroku ps

# Scale web dyno
heroku ps:scale web=1

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📱 Your app is available at:${NC}"
echo "   https://$ACTUAL_APP_NAME.herokuapp.com"
echo ""
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo "   heroku logs --tail         (view logs)"
echo "   heroku open               (open app in browser)"
echo "   heroku config             (view environment variables)"
echo "   heroku restart            (restart app)"
echo ""

# Ask if user wants to open the app
echo -e "${BLUE}🌐 Open the app in your browser? (y/n):${NC}"
read -r OPEN_APP

if [[ "$OPEN_APP" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    heroku open
fi

echo -e "${GREEN}✅ Heroku deployment script completed!${NC}"
