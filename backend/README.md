# Property Valuation Backend

A FastAPI-based backend for the AI property valuation recommendation system.

## Features

- **Property Recommendation Engine**: ML-powered comparable property selection
- **Explainability Layer**: AI-generated explanations for recommendations
- **Performance Metrics**: Model validation and performance tracking
- **Self-Improving System**: Feedback integration for continuous learning

## Tech Stack

- **Framework**: FastAPI
- **ML Libraries**: Scikit-learn, LightGBM, SHAP, LIME
- **Database**: PostgreSQL with SQLAlchemy
- **Caching**: Redis
- **Background Tasks**: Celery
- **RL**: Stable-Baselines3

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

- `POST /api/recommendations` - Get property recommendations
- `POST /api/feedback` - Submit user feedback
- `GET /api/performance` - Get model performance metrics
- `POST /api/upload` - Upload training data
- `POST /api/retrain` - Retrain the model

## Documentation

API documentation available at: `http://localhost:8000/docs`
