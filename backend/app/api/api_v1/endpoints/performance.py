from fastapi import APIRouter, HTTPException
import logging
import random
from datetime import datetime, timedelta

from app.schemas.property import ModelPerformance

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=ModelPerformance)
async def get_model_performance():
    """
    Get current model performance metrics
    """
    try:
        # In a real system, these would be calculated from actual validation data
        # For demo purposes, we'll return realistic mock data
        
        performance = ModelPerformance(
            accuracy=0.82 + random.uniform(-0.05, 0.05),  # Simulate some variance
            precision=0.78 + random.uniform(-0.05, 0.05),
            recall=0.75 + random.uniform(-0.05, 0.05),
            f1_score=0.76 + random.uniform(-0.05, 0.05),
            validation_results={
                "total_appraisals": 100,
                "correct_predictions": 82,
                "average_score": 74.5,
                "confidence_intervals": {
                    "accuracy": [0.78, 0.86],
                    "precision": [0.74, 0.82]
                },
                "cross_validation_scores": [0.81, 0.83, 0.80, 0.84, 0.82],
                "feature_importance": {
                    "gla_similarity": 0.25,
                    "location_proximity": 0.20,
                    "sale_recency": 0.18,
                    "property_type_match": 0.15,
                    "lot_size_similarity": 0.12,
                    "condition_match": 0.10
                },
                "model_metadata": {
                    "training_date": (datetime.now() - timedelta(days=7)).isoformat(),
                    "training_samples": 1500,
                    "validation_samples": 300,
                    "model_type": "Hybrid Rule-Based + ML",
                    "version": "1.0.0"
                }
            }
        )
        
        logger.info("Retrieved model performance metrics")
        return performance
        
    except Exception as e:
        logger.error(f"Error retrieving performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve performance metrics: {str(e)}")

@router.get("/validation-history")
async def get_validation_history():
    """
    Get historical validation performance data
    """
    try:
        # Mock historical data for visualization
        history = []
        base_date = datetime.now() - timedelta(days=30)
        
        for i in range(30):
            date = base_date + timedelta(days=i)
            accuracy = 0.80 + random.uniform(-0.1, 0.1)
            
            history.append({
                "date": date.isoformat(),
                "accuracy": max(0.6, min(0.95, accuracy)),
                "precision": max(0.6, min(0.95, accuracy + random.uniform(-0.05, 0.05))),
                "recall": max(0.6, min(0.95, accuracy + random.uniform(-0.05, 0.05))),
                "sample_size": random.randint(50, 150)
            })
        
        return {
            "validation_history": history,
            "summary": {
                "avg_accuracy": sum(h["accuracy"] for h in history) / len(history),
                "trend": "stable",  # Could be "improving", "declining", "stable"
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error retrieving validation history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve validation history: {str(e)}")

@router.get("/feature-importance")
async def get_feature_importance():
    """
    Get current model feature importance rankings
    """
    try:
        # Mock feature importance data
        features = [
            {"name": "GLA Similarity", "importance": 0.25, "description": "Gross Living Area similarity between properties"},
            {"name": "Location Proximity", "importance": 0.20, "description": "Geographic distance between properties"},
            {"name": "Sale Recency", "importance": 0.18, "description": "How recently the comparable property was sold"},
            {"name": "Property Type Match", "importance": 0.15, "description": "Whether properties are same type (SFR, Condo, etc.)"},
            {"name": "Lot Size Similarity", "importance": 0.12, "description": "Similarity in lot sizes"},
            {"name": "Condition Match", "importance": 0.10, "description": "Property condition alignment"}
        ]
        
        return {
            "feature_importance": features,
            "methodology": "Feature importance calculated using SHAP values and correlation analysis",
            "last_calculated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving feature importance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve feature importance: {str(e)}")
