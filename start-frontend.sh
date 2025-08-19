#!/bin/bash

# This script starts the frontend server

# Store the current directory
CURRENT_DIR=$(pwd)
FRONTEND_DIR="$CURRENT_DIR/frontend"

# Navigate to frontend directory
cd "$FRONTEND_DIR"

# Check if node_modules exists, if not, run npm install
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Make sure all dependencies are installed
echo "Making sure all dependencies are installed..."
npm install

# Generate GraphQL types (if backend is running)
echo "Generating GraphQL types..."
if command -v curl >/dev/null 2>&1; then
    if curl -s http://localhost:8000/graphql > /dev/null 2>&1; then
        npm run codegen
        echo "GraphQL types generated successfully!"
    else
        echo "Warning: Backend not running. GraphQL types not generated."
        echo "Start the backend first with: ./start-backend.sh"
    fi
else
    echo "Warning: curl not available. Skipping GraphQL type generation."
    echo "Start the backend first with: ./start-backend.sh"
fi

# Use direct command to run vite
echo "Starting frontend server at http://localhost:5173..."
echo "Make sure backend is running at http://localhost:8000 for full functionality"

# Check if node is available
if command -v node >/dev/null 2>&1; then
    node "./node_modules/vite/bin/vite.js"
else
    echo "Error: Node.js not found. Please install Node.js and try again."
    exit 1
fi
