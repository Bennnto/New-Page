#!/bin/bash

echo "🚀 Page Project - Quick Setup & Deployment Fix Script"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Checking current setup...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in Page Project root directory${NC}"
    exit 1
fi

# Check if MongoDB is needed
echo -e "${YELLOW}🔍 Checking MongoDB connection...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB not running locally${NC}"
    echo -e "${BLUE}💡 Options:${NC}"
    echo "   1. Use MongoDB Atlas (recommended): https://cloud.mongodb.com"
    echo "   2. Install MongoDB locally: brew install mongodb-community"
    echo "   3. Use Docker: docker run -d -p 27017:27017 mongo"
fi

# Fix frontend environment
echo -e "${BLUE}🔧 Fixing frontend environment...${NC}"
if [ ! -f "client/.env" ]; then
    echo "Creating client/.env..."
    cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
REACT_APP_APP_NAME=Page Project
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
EOF
    echo -e "${GREEN}✅ Created client/.env${NC}"
else
    echo -e "${GREEN}✅ client/.env already exists${NC}"
fi

# Check backend dependencies
echo -e "${BLUE}📦 Checking backend dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
fi

# Check frontend dependencies
echo -e "${BLUE}📦 Checking frontend dependencies...${NC}"
cd client
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Fix security vulnerabilities
echo -e "${BLUE}🔒 Fixing security vulnerabilities...${NC}"
echo -e "${YELLOW}⚠️  Found security issues in frontend dependencies${NC}"
echo "Would you like to fix them? This might cause breaking changes. (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    npm audit fix --force
    echo -e "${GREEN}✅ Security issues fixed${NC}"
fi

cd ..

# Check environment variables
echo -e "${BLUE}🔑 Checking environment configuration...${NC}"
if grep -q "your_super_secret" .env; then
    echo -e "${YELLOW}⚠️  Default JWT_SECRET detected - should be changed for production${NC}"
fi

if grep -q "sk_test_your_stripe" .env; then
    echo -e "${YELLOW}⚠️  Default Stripe keys detected - need real keys for payments${NC}"
fi

# Create development start script
echo -e "${BLUE}📝 Creating development start scripts...${NC}"

cat > start-dev.sh << EOF
#!/bin/bash
echo "🚀 Starting Page Project in Development Mode..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Starting backend server..."
npm run dev &
BACKEND_PID=\$!

echo "Waiting 3 seconds before starting frontend..."
sleep 3

echo "Starting frontend..."
cd client && npm start &
FRONTEND_PID=\$!

echo ""
echo "✅ Both servers are starting..."
echo "📝 Backend PID: \$BACKEND_PID"
echo "📝 Frontend PID: \$FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill \$BACKEND_PID \$FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-dev.sh

cat > start-backend-only.sh << EOF
#!/bin/bash
echo "🚀 Starting Backend Server Only..."
echo "API will be available at: http://localhost:5000"
npm run dev
EOF

chmod +x start-backend-only.sh

echo -e "${GREEN}✅ Created start scripts:${NC}"
echo "   - ./start-dev.sh (both frontend & backend)"
echo "   - ./start-backend-only.sh (backend only)"

# Final status report
echo ""
echo -e "${GREEN}🎉 Setup Complete! Next Steps:${NC}"
echo ""
echo -e "${BLUE}1. Database Setup:${NC}"
echo "   • For MongoDB Atlas: Update MONGODB_URI in .env"
echo "   • For local MongoDB: Install and start MongoDB service"
echo ""
echo -e "${BLUE}2. Payment Setup:${NC}"
echo "   • Get Stripe API keys from: https://dashboard.stripe.com"
echo "   • Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY"
echo ""
echo -e "${BLUE}3. Start Development:${NC}"
echo "   ./start-dev.sh"
echo ""
echo -e "${BLUE}4. Test Features:${NC}"
echo "   • Registration/Login"
echo "   • File uploads"
echo "   • Payment processing"
echo "   • All dashboard features"
echo ""
echo -e "${YELLOW}📖 See deployment-fix.md for detailed instructions${NC}"
