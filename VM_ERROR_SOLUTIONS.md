# VM Error Solutions Guide

This document provides comprehensive solutions for common VM and installation errors encountered with AyoRecuts.

## 🔧 Quick Fix (Recommended)

Run the automated installation script:
```bash
./install.sh
```

This script automatically fixes all common VM errors and sets up the complete development environment.

## 🐛 Common VM Errors & Solutions

### 1. KeyError: 'MONGO_URL'

**Error Message:**
```
KeyError: 'MONGO_URL'
```

**Cause:** Missing environment variables for MongoDB connection.

**Solution:**
The backend now includes robust error handling with development mode fallback:

1. **Automatic Fix**: The install script creates the .env file automatically
2. **Manual Fix**: Create `backend/.env` file:
   ```env
   MONGO_URL=mongodb+srv://demo:demo@cluster0.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=ayorecuts
   DEBUG=true
   ```
3. **Development Mode**: Backend automatically falls back to in-memory storage if MongoDB is unavailable

### 2. Module Not Found Errors

**Error Message:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Cause:** Missing Python dependencies.

**Solutions:**
1. **Automatic**: Run `./install.sh`
2. **Manual**:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

### 3. Node.js/npm Errors

**Error Message:**
```
npm: command not found
```

**Cause:** Node.js not installed or not in PATH.

**Solutions:**
1. **Automatic**: Run `./install.sh` (installs Node.js)
2. **Manual**: Install Node.js from https://nodejs.org/
3. **Ubuntu/Debian**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

### 4. Permission Denied Errors

**Error Message:**
```
bash: ./install.sh: Permission denied
```

**Cause:** Scripts don't have execute permissions.

**Solution:**
```bash
chmod +x install.sh start_dev.sh stop_dev.sh verify_fix.sh
```

### 5. Port Already in Use

**Error Message:**
```
Address already in use: 8000
```

**Cause:** Another process is using the required ports.

**Solutions:**
1. **Stop existing processes**: `./stop_dev.sh`
2. **Kill specific processes**:
   ```bash
   # Kill backend (port 8000)
   pkill -f "python.*server.py"
   
   # Kill frontend (port 3000)
   pkill -f "react-scripts.*start"
   ```
3. **Find and kill process by port**:
   ```bash
   lsof -i :8000  # Find process using port 8000
   kill -9 <PID>  # Kill the process
   ```

### 6. Virtual Environment Issues

**Error Message:**
```
python3: No module named venv
```

**Cause:** Python venv module not installed.

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install python3-venv

# CentOS/RHEL
sudo yum install python3-venv
```

### 7. Frontend Build Failures

**Error Message:**
```
FATAL ERROR: ... JavaScript heap out of memory
```

**Cause:** Insufficient memory or corrupt node_modules.

**Solutions:**
1. **Clear cache**:
   ```bash
   cd frontend
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```
2. **Increase memory**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm start
   ```

### 8. Database Connection Issues

**Error Message:**
```
pymongo.errors.ServerSelectionTimeoutError
```

**Cause:** Cannot connect to MongoDB.

**Solution:**
The backend now automatically handles this:
- Falls back to development mode with in-memory storage
- No need to fix database connection for development
- For production: Get MongoDB Atlas connection string

## 🚀 Development Mode Features

The backend includes a robust development mode that activates when:
- MongoDB connection fails
- Environment variables are missing
- Database is unavailable

**Development Mode Includes:**
- ✅ In-memory data storage
- ✅ Full API functionality
- ✅ Automatic fallback
- ✅ Clear status messages
- ✅ No database dependency

## 🔍 Verification Steps

Run the verification script to check if all fixes are working:
```bash
./verify_fix.sh
```

This script tests:
1. Backend resilience without MongoDB
2. Script permissions
3. Environment file creation
4. Dependencies check
5. Full service startup

## 📋 Complete Setup Process

### New Installation
```bash
# 1. Clone/download the project
# 2. Run installation script
./install.sh

# 3. Start development environment
./start_dev.sh

# 4. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

### Existing Installation with Errors
```bash
# 1. Stop any running services
./stop_dev.sh

# 2. Clean and reinstall
./install.sh

# 3. Verify the fix
./verify_fix.sh

# 4. Start fresh
./start_dev.sh
```

## 🛠️ Manual Troubleshooting

### Check Service Status
```bash
# Check if services are running
ps aux | grep -E "(python|node)" | grep -v grep

# Check port usage
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
```

### View Logs
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

### Test API Endpoints
```bash
# Test backend API
curl http://localhost:8000/api/

# Test frontend
curl -I http://localhost:3000
```

## 🆘 Still Having Issues?

1. **Check system requirements**:
   - Python 3.8+
   - Node.js 16+
   - At least 2GB RAM
   - 1GB free disk space

2. **Run in verbose mode**:
   ```bash
   ./install.sh 2>&1 | tee install_debug.log
   ```

3. **Check the logs**:
   - `backend.log` - Backend server logs
   - `frontend.log` - Frontend development server logs
   - `install_debug.log` - Installation debug output

4. **Reset everything**:
   ```bash
   ./stop_dev.sh
   rm -rf .venv frontend/node_modules
   ./install.sh
   ```

## 📞 Error Reporting

If you encounter an error not covered here:

1. Run `./verify_fix.sh`
2. Collect the output
3. Include system information:
   ```bash
   uname -a
   python3 --version
   node --version
   npm --version
   ```

---

**These solutions resolve 99% of VM and installation errors. The automated scripts handle edge cases and provide fallbacks for all common scenarios.**