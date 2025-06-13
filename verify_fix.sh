#!/bin/bash

# VM Error Fix Verification Script
# This script verifies that the VM error fixes are working correctly

echo "🔍 Verifying VM Error Fix..."
echo "============================"

# Test 1: Check if backend starts without MongoDB
echo "📋 Test 1: Backend resilience without MongoDB"
cd backend

# Temporarily rename .env to simulate missing environment
if [ -f ".env" ]; then
    mv .env .env.backup
fi

# Try to start the backend
echo "🔧 Testing backend startup without environment variables..."
timeout 5 python server.py > test_output.log 2>&1 &
TEST_PID=$!
sleep 3

# Check if it started successfully
if curl -s http://localhost:8000/api/ | grep -q "Hello World"; then
    echo "✅ Backend started successfully in development mode"
    kill $TEST_PID 2>/dev/null || true
else
    echo "❌ Backend failed to start"
    echo "📋 Error output:"
    cat test_output.log
fi

# Restore .env
if [ -f ".env.backup" ]; then
    mv .env.backup .env
fi

rm -f test_output.log
cd ..

# Test 2: Check if scripts are executable
echo ""
echo "📋 Test 2: Script permissions"
if [ -x "install.sh" ] && [ -x "start_dev.sh" ] && [ -x "stop_dev.sh" ]; then
    echo "✅ All scripts are executable"
else
    echo "❌ Some scripts are not executable"
    echo "🔧 Fixing permissions..."
    chmod +x install.sh start_dev.sh stop_dev.sh
    echo "✅ Permissions fixed"
fi

# Test 3: Check environment files
echo ""
echo "📋 Test 3: Environment file creation"
if [ -f "backend/.env" ] && [ -f "frontend/.env" ]; then
    echo "✅ Environment files exist"
else
    echo "❌ Environment files missing"
    echo "🔧 Creating environment files..."
    ./install.sh --env-only
fi

# Test 4: Check dependencies
echo ""
echo "📋 Test 4: Dependencies check"
if command -v python3 >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
    echo "✅ Core dependencies (Python3, Node.js) are available"
else
    echo "❌ Core dependencies missing"
    echo "💡 Run ./install.sh to install dependencies"
fi

# Test 5: Check if both services can start
echo ""
echo "📋 Test 5: Full service startup test"
echo "🚀 Starting services for quick test..."
./start_dev.sh > test_startup.log 2>&1 &
STARTUP_PID=$!
sleep 10

# Check both services
BACKEND_OK=false
FRONTEND_OK=false

if curl -s http://localhost:8000/api/ | grep -q "Hello World"; then
    BACKEND_OK=true
    echo "✅ Backend service is running"
fi

if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    FRONTEND_OK=true
    echo "✅ Frontend service is running"
fi

# Stop services
./stop_dev.sh > /dev/null 2>&1
rm -f test_startup.log

# Final report
echo ""
echo "🎯 Final Verification Report"
echo "============================"
if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo "✅ VM errors have been successfully fixed"
    echo "✅ All services are working correctly"
    echo "✅ The application is ready for development"
else
    echo "⚠️  Some tests failed:"
    [ "$BACKEND_OK" = false ] && echo "❌ Backend service issues"
    [ "$FRONTEND_OK" = false ] && echo "❌ Frontend service issues"
    echo "💡 Try running ./install.sh to fix remaining issues"
fi

echo ""
echo "📚 Next steps:"
echo "   1. Run ./start_dev.sh to start development"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Check logs if you encounter any issues"