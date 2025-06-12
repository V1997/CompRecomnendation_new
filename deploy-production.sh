#!/bin/bash
# Production Deployment Script
# Deploys the Property Valuation System for production use

set -e

echo "🚀 Starting Production Deployment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed."; exit 1; }

# Backend setup
echo "🐍 Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# Database setup
echo "🗄️  Setting up database..."
if [ -f ".env" ]; then
    source .env
    createdb $DATABASE_URL 2>/dev/null || echo "Database already exists"
fi

# Frontend setup
echo "⚛️  Setting up frontend..."
cd ../frontend
npm install
npm run build

echo "✅ Production deployment complete!"
echo "🌐 Frontend: http://localhost:3000 (npm run start)"
echo "🔧 Backend: http://localhost:8000 (uvicorn main:app --host 0.0.0.0 --port 8000)"
echo "📖 API Docs: http://localhost:8000/docs"
