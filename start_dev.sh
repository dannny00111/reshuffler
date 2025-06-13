#!/bin/bash

# AyoRecuts Development Startup Script
# This script resolves VM installation errors and starts both backend and frontend

echo "🚀 Starting AyoRecuts Development Environment..."
echo "========================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ All required dependencies are available"

# Setup virtual environment for backend
echo "🐍 Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
source .venv/bin/activate
echo "✅ Virtual environment activated"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  No requirements.txt found in backend directory"
fi

# Check if .env exists, create if not
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << 'EOF'
# Backend Environment Configuration
MONGO_URL=mongodb+srv://demo:demo@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME=ayorecuts
DEBUG=true
LOG_LEVEL=INFO
CORS_ORIGINS=*
EOF
    echo "✅ Backend .env file created"
fi

cd ..

# Install frontend dependencies
echo "🌐 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
fi

# Check if .env exists, create if not
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_OPENROUTER_API_KEY=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
REACT_APP_DEBUG=true
REACT_APP_ENV=development
EOF
    echo "✅ Frontend .env file created"
fi

cd ..

# Kill existing processes if running
echo "🧹 Cleaning up existing processes..."
if port_in_use 8000; then
    echo "🔄 Stopping existing backend server on port 8000..."
    pkill -f "python.*server.py" || true
    sleep 2
fi

if port_in_use 3000; then
    echo "🔄 Stopping existing frontend server on port 3000..."
    pkill -f "react-scripts.*start" || true
    sleep 2
fi

# Start backend server
echo "🔧 Starting backend server..."
cd backend
python server.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏱️  Waiting for backend to start..."
sleep 5

# Check if backend is running
if port_in_use 8000; then
    echo "✅ Backend server started successfully on http://localhost:8000"
    # Test backend API
    if curl -s http://localhost:8000/api/ | grep -q "Hello World"; then
        echo "✅ Backend API is responding correctly"
    else
        echo "⚠️  Backend API test failed"
    fi
else
    echo "❌ Backend server failed to start"
    echo "📋 Backend logs:"
    cat backend.log
    exit 1
fi

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏱️  Waiting for frontend to start..."
sleep 15

# Check if frontend is running
if port_in_use 3000; then
    echo "✅ Frontend server started successfully on http://localhost:3000"
else
    echo "⚠️  Frontend server may still be starting..."
    echo "📋 Frontend logs (last 10 lines):"
    tail -10 frontend.log
fi

echo ""
echo "🎉 AyoRecuts Development Environment Started!"
echo "========================================"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000/api/"
echo "📊 Backend Docs: http://localhost:8000/docs"
echo ""
echo "📝 Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📋 To stop the servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or run: ./stop_dev.sh"
echo ""
echo "📄 Logs:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "✨ Ready to develop! Open http://localhost:3000 in your browser."