#!/bin/bash

echo "🚀 CodeSphere - Web Application Startup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo ""
echo "🌐 Starting CodeSphere Web Application..."
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3001"
echo ""

# Start both frontend and backend
npm run dev &
FRONTEND_PID=$!

cd server
npm start &
SERVER_PID=$!

echo "✅ Both servers started successfully!"
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $FRONTEND_PID $SERVER_PID 2>/dev/null; exit 0" INT

wait