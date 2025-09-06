#!/bin/bash

echo "🚀 Building Page Project for Render..."

# Set environment variables for build
export CI=false
export GENERATE_SOURCEMAP=false
export NODE_OPTIONS="--max-old-space-size=4096"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies with legacy peer deps
echo "📦 Installing frontend dependencies..."
cd client
npm install --legacy-peer-deps

# Build frontend
echo "🏗️ Building React frontend..."
npm run build

echo "✅ Build completed successfully!"
