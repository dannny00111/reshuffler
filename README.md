# AyoRecuts - Social Media Video Optimizer

**Transform your videos into viral content with AI-powered optimization**

## 🚀 Quick Start (VM Error Fix Included!)

If you're experiencing VM installation errors, our automated scripts will fix them:

### 1. One-Command Installation
```bash
./install.sh
```
This script will:
- ✅ Fix all VM and dependency errors
- ✅ Install Python 3, Node.js, and all required packages
- ✅ Set up virtual environments
- ✅ Create necessary configuration files
- ✅ Test the installation

### 2. Start Development Environment
```bash
./start_dev.sh
```
This will start both backend (port 8000) and frontend (port 3000) servers.

### 3. Stop Development Environment
```bash
./stop_dev.sh
```

## 🔧 Manual Installation (If Scripts Don't Work)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your MongoDB connection
cp .env.example .env  # Edit with your settings
python server.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🌐 Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Common VM Errors & Solutions

### Error: "MONGO_URL not found"
**Solution**: The install script creates the .env file automatically. If still failing:
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string
```

### Error: "Module not found" or dependency issues
**Solution**: Run the installation script:
```bash
./install.sh
```

### Error: "Permission denied" or "Command not found"
**Solution**: Ensure scripts are executable:
```bash
chmod +x install.sh start_dev.sh stop_dev.sh
```

### Error: Frontend won't start or build fails
**Solution**: Clear cache and reinstall:
```bash
cd frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure
```
AyoRecuts/
├── backend/           # FastAPI backend server
│   ├── server.py     # Main server file
│   ├── .env          # Environment variables
│   └── requirements.txt
├── frontend/         # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   ├── .env          # Frontend environment variables
│   └── package.json
├── install.sh        # 🔧 VM Error Fix & Installation
├── start_dev.sh      # 🚀 Start development servers
├── stop_dev.sh       # 🛑 Stop development servers
└── DEPLOYMENT_GUIDE.md
```

## 🎯 Features
- 🎬 **Video Processing**: FFmpeg-powered video optimization
- 🤖 **AI Integration**: OpenRouter API for viral content generation
- 📱 **Mobile-First**: Progressive Web App with Dynamic Island support
- ⚡ **Ultra-Fast**: Optimized processing algorithms
- 🎨 **Modern UI**: Glass morphism design with animations
- 🔄 **Background Processing**: Service worker integration
- 📊 **Platform Optimization**: TikTok, Instagram, YouTube ready

## 🔗 Environment Variables

### Backend (.env)
```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=ayorecuts
DEBUG=true
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key
REACT_APP_DEBUG=true
```

## 🚀 Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for free hosting options.

## 🆘 Troubleshooting

### Still having issues?
1. **Check logs**: `backend.log` and `frontend.log`
2. **Verify ports**: Backend (8000), Frontend (3000)
3. **MongoDB**: Ensure connection string is correct
4. **Dependencies**: Run `./install.sh` again

### Development Mode
The backend automatically falls back to in-memory storage if MongoDB is unavailable, perfect for development and testing.

---

**Made with ❤️ for content creators worldwide**