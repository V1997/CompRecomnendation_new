from fastapi import APIRouter, HTTPException
from typing import List
import logging

from app.schemas.property import UserFeedback

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory storage for demo (in production, use database)
feedback_storage: List[UserFeedback] = []

@router.post("/")
async def submit_user_feedback(feedback: UserFeedback):
    """
    Submit user feedback for model improvement
    """
    try:
        # Store feedback (in production, this would go to a database)
        feedback_storage.append(feedback)
        
        logger.info(f"Received feedback for appraisal {feedback.appraisal_id} with rating {feedback.rating}")
        
        # In a real system, this would trigger model retraining if threshold is met
        if len(feedback_storage) >= 10:  # Placeholder threshold
            logger.info("Feedback threshold reached - would trigger model retraining")
        
        return {
            "message": "Feedback received successfully",
            "appraisal_id": feedback.appraisal_id,
            "total_feedback_count": len(feedback_storage)
        }
        
    except Exception as e:
        logger.error(f"Error storing feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store feedback: {str(e)}")

@router.get("/")
async def get_feedback_summary():
    """
    Get summary of user feedback for analytics
    """
    try:
        if not feedback_storage:
            return {
                "total_feedback": 0,
                "average_rating": 0,
                "feedback_distribution": {}
            }
        
        total_feedback = len(feedback_storage)
        average_rating = sum(f.rating for f in feedback_storage) / total_feedback
        
        # Rating distribution
        rating_counts = {}
        for feedback in feedback_storage:
            rating_counts[feedback.rating] = rating_counts.get(feedback.rating, 0) + 1
        
        return {
            "total_feedback": total_feedback,
            "average_rating": round(average_rating, 2),
            "feedback_distribution": rating_counts,
            "recent_comments": [f.comments for f in feedback_storage[-5:] if f.comments]
        }
        
    except Exception as e:
        logger.error(f"Error retrieving feedback summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve feedback summary: {str(e)}")

@router.post("/retrain")
async def trigger_model_retrain():
    """
    Trigger model retraining with accumulated feedback
    """
    try:
        # In a real system, this would:
        # 1. Collect all feedback data
        # 2. Prepare training dataset
        # 3. Retrain the model
        # 4. Validate model performance
        # 5. Deploy new model if performance improved
        
        logger.info("Model retraining triggered")
        
        return {
            "message": "Model retraining initiated",
            "feedback_used": len(feedback_storage),
            "status": "queued"  # In reality, this would be an async task
        }
        
    except Exception as e:
        logger.error(f"Error triggering model retrain: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to trigger retrain: {str(e)}")
