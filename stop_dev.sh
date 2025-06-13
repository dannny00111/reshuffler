#!/bin/bash

# AyoRecuts Development Stop Script
# This script stops all development servers

echo "🛑 Stopping AyoRecuts Development Environment..."
echo "=============================================="

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Stop backend server
if port_in_use 8000; then
    echo "🔄 Stopping backend server (port 8000)..."
    pkill -f "python.*server.py" || true
    sleep 2
    if port_in_use 8000; then
        echo "⚠️  Force killing backend server..."
        pkill -9 -f "python.*server.py" || true
    fi
    echo "✅ Backend server stopped"
else
    echo "ℹ️  Backend server is not running"
fi

# Stop frontend server
if port_in_use 3000; then
    echo "🔄 Stopping frontend server (port 3000)..."
    pkill -f "react-scripts.*start" || true
    sleep 2
    if port_in_use 3000; then
        echo "⚠️  Force killing frontend server..."
        pkill -9 -f "react-scripts.*start" || true
    fi
    echo "✅ Frontend server stopped"
else
    echo "ℹ️  Frontend server is not running"
fi

# Clean up log files
if [ -f "backend.log" ]; then
    echo "🧹 Cleaning up backend.log"
    rm backend.log
fi

if [ -f "frontend.log" ]; then
    echo "🧹 Cleaning up frontend.log"
    rm frontend.log
fi

echo ""
echo "✅ AyoRecuts Development Environment Stopped!"
echo "=============================================="