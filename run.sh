#!/bin/bash

echo "🚀 Starting CodeSphere..."

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001,8080 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend server
echo "📡 Starting backend server..."
cd server
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait and check backend
echo "⏳ Waiting for backend to start..."
sleep 4
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "❌ Backend failed to start. Check backend.log"
    cat backend.log
    exit 1
fi
echo "✅ Backend started successfully"

# Start frontend
echo "🎨 Starting frontend..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait and check frontend
echo "⏳ Waiting for frontend to start..."
sleep 5
if ! curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "❌ Frontend failed to start. Check frontend.log"
    cat frontend.log
    exit 1
fi
echo "✅ Frontend started successfully"

# Open in Chrome
echo "🌐 Opening in Chrome..."
open -a "Google Chrome" http://localhost:8080

echo "✅ CodeSphere is running!"
echo "📡 Backend: http://localhost:3001"
echo "🎨 Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"

# Cleanup function
cleanup() {
    echo "\n🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Wait for user to stop
wait