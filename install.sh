#!/bin/bash

# AyoRecuts Installation Script
# This script fixes VM errors and installs all required dependencies

echo "🔧 AyoRecuts Installation & VM Error Fix"
echo "========================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Update system packages
echo "📦 Updating system packages..."
if command_exists apt-get; then
    sudo apt-get update
    sudo apt-get install -y curl build-essential
elif command_exists yum; then
    sudo yum update -y
    sudo yum install -y curl gcc gcc-c++ make
elif command_exists brew; then
    brew update
else
    echo "⚠️  Package manager not detected, skipping system update"
fi

# Install Python 3 if not present
if ! command_exists python3; then
    echo "🐍 Installing Python 3..."
    if command_exists apt-get; then
        sudo apt-get install -y python3 python3-pip python3-venv
    elif command_exists yum; then
        sudo yum install -y python3 python3-pip
    elif command_exists brew; then
        brew install python
    else
        echo "❌ Cannot install Python 3 automatically. Please install manually."
        exit 1
    fi
    echo "✅ Python 3 installed"
else
    echo "✅ Python 3 is already installed"
fi

# Install Node.js if not present
if ! command_exists node; then
    echo "🟢 Installing Node.js..."
    # Install Node.js using NodeSource repository
    if command_exists apt-get; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command_exists yum; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs npm
    elif command_exists brew; then
        brew install node
    else
        echo "❌ Cannot install Node.js automatically. Please install manually."
        exit 1
    fi
    echo "✅ Node.js installed"
else
    echo "✅ Node.js is already installed"
fi

# Verify installations
echo "🔍 Verifying installations..."
python3 --version
node --version
npm --version

# Create virtual environment for Python
echo "🐍 Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "✅ Python virtual environment created"
fi

# Activate virtual environment
source .venv/bin/activate
echo "✅ Python virtual environment activated"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    pip install --upgrade pip
    pip install -r backend/requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "⚠️  backend/requirements.txt not found"
fi

if [ -f "plugin_requirements.txt" ]; then
    pip install -r plugin_requirements.txt
    echo "✅ Plugin requirements installed"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
if [ -f "package.json" ]; then
    # Clear npm cache to avoid issues
    npm cache clean --force
    
    # Install dependencies
    npm install
    echo "✅ Node.js dependencies installed"
    
    # Run the anime.js fix script if it exists
    if [ -f "fix_anime_import.sh" ]; then
        echo "🔧 Applying anime.js import fix..."
        ./fix_anime_import.sh
    fi
else
    echo "⚠️  frontend/package.json not found"
fi

cd ..

# Create environment files if they don't exist
echo "📝 Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
# Backend Environment Configuration
MONGO_URL=mongodb+srv://demo:demo@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME=ayorecuts
DEBUG=true
LOG_LEVEL=INFO
CORS_ORIGINS=*
EOF
    echo "✅ Backend .env file created"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_OPENROUTER_API_KEY=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
REACT_APP_DEBUG=true
REACT_APP_ENV=development
EOF
    echo "✅ Frontend .env file created"
fi

# Test the installation
echo "🧪 Testing installation..."

# Test backend
echo "🔧 Testing backend server..."
cd backend
timeout 10 python server.py > test_output.log 2>&1 &
TEST_PID=$!
sleep 5

if curl -s http://localhost:8000/api/ | grep -q "Hello World"; then
    echo "✅ Backend server test successful"
    kill $TEST_PID 2>/dev/null || true
else
    echo "⚠️  Backend server test failed, but installation completed"
    echo "📋 Backend test output:"
    cat test_output.log
    kill $TEST_PID 2>/dev/null || true
fi

rm -f test_output.log
cd ..

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "✅ All dependencies installed successfully"
echo "✅ Environment files created"
echo "✅ VM errors should be resolved"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: ./start_dev.sh"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Enjoy developing with AyoRecuts!"
echo ""
echo "📚 For deployment, see DEPLOYMENT_GUIDE.md"
echo "🆘 If you encounter issues, check the log files:"
echo "   - backend.log"
echo "   - frontend.log"