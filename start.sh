#!/bin/bash

echo "🚀 Starting Configuration File Generator Application"
echo "=================================================="

# Check if MongoDB is running locally
echo "📊 Checking MongoDB connection..."
if ! mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "❌ MongoDB is not running or not accessible."
    echo "Please ensure MongoDB is installed and running locally."
    echo ""
    echo "Installation options:"
    echo "1. Install MongoDB Community Edition: https://docs.mongodb.com/manual/installation/"
    echo "2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
    echo "3. Install via Homebrew (macOS): brew install mongodb-community"
    echo ""
    echo "After installation, start MongoDB:"
    echo "  - macOS: brew services start mongodb-community"
    echo "  - Linux: sudo systemctl start mongod"
    echo "  - Windows: Start MongoDB service"
    exit 1
fi

echo "✅ MongoDB is running!"

# Start Backend
echo "🐍 Starting FastAPI Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

echo "🚀 Starting FastAPI server..."
echo "   Backend will be available at: http://localhost:8000"
echo "   API documentation at: http://localhost:8000/docs"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Start Frontend
echo "⚡ Starting Angular Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🚀 Starting Angular development server..."
echo "   Frontend will be available at: http://localhost:4200"
npm start &
FRONTEND_PID=$!

cd ..

echo ""
echo "🎉 Application is starting up!"
echo "=============================="
echo "📊 MongoDB: mongodb://localhost:27017"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🌐 Frontend: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait 