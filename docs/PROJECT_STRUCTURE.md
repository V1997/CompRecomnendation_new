# 📁 Project Structure Documentation

## 🏗️ Reorganized Directory Structure

This document explains the purpose and organization of all directories and files in the Property Valuation System after production cleanup and restructuring.

```
CompRecommendation_new/
├── README.md                    # Main project documentation
├── .gitignore                   # Git ignore patterns for production
│
├── 📁 backend/                  # Python FastAPI Backend Application
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment configuration (production)
│   ├── .env.example            # Environment template
│   │
│   ├── 📁 app/                  # Main application package
│   │   ├── __init__.py
│   │   │
│   │   ├── 📁 api/              # API routing and endpoints
│   │   │   ├── __init__.py
│   │   │   ├── 📁 api_v1/       # API version 1
│   │   │   │   ├── api.py       # Main API router
│   │   │   │   ├── __init__.py
│   │   │   │   └── 📁 endpoints/ # Individual API endpoints
│   │   │   │       ├── dataset.py        # Dataset and smart recommendations
│   │   │   │       ├── recommendations.py # Standard recommendations
│   │   │   │       ├── feedback.py       # User feedback collection
│   │   │   │       ├── performance.py    # Performance metrics
│   │   │   │       └── upload.py         # File upload handling
│   │   │   │
│   │   │   ├── 📁 core/         # Core application configuration
│   │   │   │   ├── config.py    # Settings and environment variables
│   │   │   │   └── __init__.py
│   │   │   │
│   │   │   ├── 📁 db/           # Database configuration and session management
│   │   │   │   └── session.py   # SQLAlchemy database sessions
│   │   │   │
│   │   │   ├── 📁 ml/           # Machine Learning components
│   │   │   │   ├── enhanced_recommendation_engine.py # Advanced ML model
│   │   │   │   ├── recommendation_engine.py          # Basic ML model
│   │   │   │   └── __init__.py
│   │   │   │
│   │   │   ├── 📁 models/       # Database models (SQLAlchemy)
│   │   │   │   ├── database.py  # Database table definitions
│   │   │   │   └── __init__.py
│   │   │   │
│   │   │   ├── 📁 schemas/      # Pydantic schemas for API validation
│   │   │   │   ├── property.py  # Property-related schemas
│   │   │   │   └── __init__.py
│   │   │   │
│   │   │   └── 📁 utils/        # Utility functions
│   │   │       ├── similarity.py # Property similarity calculations
│   │   │       └── __init__.py
│   │   │
│   │   ├── 📁 data/             # Dataset storage
│   │   │   └── appraisals_dataset.json # Real Canadian property data (22MB)
│   │   │
│   │   ├── 📁 models/           # Trained ML models and artifacts
│   │   │   ├── feature_scaler.pkl    # Feature scaling model
│   │   │   ├── similarity_model.pkl  # Trained similarity model
│   │   │   └── model_metadata.json   # Model version and performance data
│   │   │
│   │   └── 📁 venv/             # Python virtual environment (auto-generated)
│   │
├── 📁 frontend/                 # Next.js React Frontend Application
│   ├── package.json             # Node.js dependencies
│   ├── next.config.js           # Next.js configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── next-env.d.ts            # Next.js TypeScript definitions
│   │
│   ├── 📁 src/                  # Source code
│   │   ├── 📁 app/              # Next.js App Router
│   │   │   ├── layout.tsx       # Root layout component
│   │   │   ├── page.tsx         # Home page component
│   │   │   ├── globals.css      # Global styles
│   │   │   │
│   │   │   └── 📁 components/   # React components
│   │   │       ├── Dashboard.tsx           # Results dashboard
│   │   │       ├── PropertySearch.tsx     # Property search form
│   │   │       ├── PropertyCard.tsx       # Individual property display
│   │   │       ├── Header.tsx             # Application header
│   │   │       ├── PerformanceMetrics.tsx # Performance display
│   │   │       └── ExplainabilityPanel.tsx # AI explanation panel
│   │   │
│   │   ├── 📁 lib/              # Utility libraries
│   │   │   ├── api.ts           # API client functions
│   │   │   └── utils.ts         # General utilities
│   │   │
│   │   ├── 📁 types/            # TypeScript type definitions
│   │   │   └── index.ts         # Shared type definitions
│   │   │
│   │   └── 📁 node_modules/     # Node.js dependencies (auto-generated)
│   │
├── 📁 deployment/               # Deployment and infrastructure
│   ├── docker-compose.yml       # Docker container orchestration
│   └── deploy-production.sh     # Production deployment script
│
└── 📁 docs/                     # Project documentation
    └── PRODUCTION_CLEANUP.md    # Production cleanup report
```

## 📋 Directory Purpose Explanation

### 🔧 **backend/** - Python FastAPI Application
- **Purpose**: Complete backend API server with ML capabilities
- **Key Features**: RESTful API, ML recommendations, database integration
- **Data**: Real Canadian property dataset (Kingston, Ontario)
- **Models**: Trained ML models with 79.6% accuracy

### ⚛️ **frontend/** - Next.js React Application  
- **Purpose**: Modern web interface for property valuation
- **Technology**: Next.js 14, TypeScript, Tailwind CSS
- **Features**: Real-time property search, interactive results, responsive UI

### 🚀 **deployment/** - Infrastructure and Deployment
- **Purpose**: Production deployment automation and configuration
- **Contents**: Docker setup, deployment scripts
- **Environment**: Production-ready configurations

### 📚 **docs/** - Project Documentation
- **Purpose**: Comprehensive project documentation
- **Contents**: Setup guides, API documentation, cleanup reports
- **Audience**: Developers, operators, stakeholders

## 🎯 Key Improvements Made

### ✅ **Better Organization**
- Dataset moved to `backend/data/` for logical grouping
- ML models moved to `backend/models/` for proximity to ML code
- Deployment files organized in dedicated directory
- Documentation centralized in `docs/`

### ✅ **Clean Root Directory**
- Removed testing artifacts and demo files
- Eliminated unnecessary `node_modules` and `venv` from root
- Streamlined to essential project files only

### ✅ **Production Focus**
- All paths updated to reflect new structure
- Environment configuration optimized for production
- Removed development-only dependencies and scripts

### ✅ **Logical Grouping**
- Related files grouped together (data, models, deployment)
- Clear separation between frontend and backend concerns
- Infrastructure and documentation properly organized

## 🔄 Updated File Paths

The following paths have been updated throughout the codebase:

| Old Path | New Path | Files Updated |
|----------|----------|---------------|
| `../appraisals_dataset.json` | `data/appraisals_dataset.json` | `dataset.py`, `enhanced_recommendation_engine.py` |
| `../models/` | `models/` | `enhanced_recommendation_engine.py` |
| Root deployment files | `deployment/` | All deployment scripts |
| Root documentation | `docs/` | Documentation organization |

## 🏃‍♂️ Running the Application

With the new structure:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Production Deployment
```bash
./deployment/deploy-production.sh
```

This reorganized structure provides better maintainability, clearer separation of concerns, and a more professional project layout suitable for production deployment.
