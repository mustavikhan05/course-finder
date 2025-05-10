#!/bin/bash

echo "Starting NSU Course Scheduler Frontend..."
echo "========================================"

# Navigate to frontend directory
cd frontend

# Check if node_modules exists, if not, install dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the development server
echo "Starting React development server..."
npm start

echo "Frontend server stopped." 