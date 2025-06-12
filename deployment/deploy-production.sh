#!/bin/bash
# Production Deployment Script
# Deploys the Property Valuation System for production use

set -e

echo "🚀 Starting Production Deployment..."
echo "📁 Using reorganized project structure"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check prerequisites
echo "🔍 Checking prerequisites..."
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed."; exit 1; }

# Backend setup
echo "🐍 Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Verify dataset exists
if [ ! -f "data/appraisals_dataset.json" ]; then
    echo "❌ Dataset file not found at data/appraisals_dataset.json"
    exit 1
fi
echo "✅ Dataset verified: $(du -h data/appraisals_dataset.json | cut -f1) Canadian property data"

# Database setup
echo "🗄️  Setting up database..."
if [ -f ".env" ]; then
    source .env
    echo "📊 Creating production database..."
    createdb ${DATABASE_URL##*/} 2>/dev/null || echo "Database already exists"
fi

# Frontend setup  
echo "⚛️  Setting up frontend..."
cd ../frontend
echo "📥 Installing Node.js dependencies..."
npm install
echo "🔨 Building frontend for production..."
npm run build

echo ""
echo "✅ Production deployment complete!"
echo "📋 Project Structure:"
echo "   📁 backend/data/     - Real Canadian dataset (22MB)"
echo "   📁 backend/models/   - Trained ML models"
echo "   📁 frontend/src/     - Next.js application"
echo "   📁 deployment/       - This deployment script"
echo "   📁 docs/            - Project documentation"
echo ""
echo "🚀 Start the application:"
echo "   🐍 Backend:  cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000"
echo "   ⚛️  Frontend: cd frontend && npm run start"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
