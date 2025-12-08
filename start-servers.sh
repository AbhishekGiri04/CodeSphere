#!/bin/bash

# Kill any existing processes on ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend server
echo "🚀 Starting backend server on port 3001..."
cd server
node index.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Start frontend server
echo "🎨 Starting frontend server on port 8080..."
HOST=0.0.0.0 PORT=8080 npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 5

# Check if servers are actually running
if lsof -i :3001 > /dev/null; then
    echo "✅ Backend running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
fi

if lsof -i :8080 > /dev/null; then
    echo "✅ Frontend running on http://localhost:8080"
    echo "🚀 CodeSphere is ready!"
    echo "🌐 Opening http://localhost:8080 in Chrome..."
    sleep 2
    open -a "Google Chrome" http://localhost:8080 2>/dev/null || echo "Chrome not found, open manually"
else
    echo "❌ Frontend failed to start on port 8080"
    echo "🔧 Trying alternative port 5173..."
    kill $FRONTEND_PID 2>/dev/null
    npx vite --port 5173 --host 0.0.0.0 &
    FRONTEND_PID=$!
    sleep 3
    if lsof -i :5173 > /dev/null; then
        echo "✅ Frontend running on http://localhost:5173"
        open -a "Google Chrome" http://localhost:5173 2>/dev/null
    fi
fi

echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for interrupt signal
trap 'echo "\n🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait