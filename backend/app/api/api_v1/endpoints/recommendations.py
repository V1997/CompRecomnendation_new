from fastapi import APIRouter, HTTPException, Depends
from typing import List
import time
import logging

from app.schemas.property import (
    AppraisalRequest, AppraisalResponse, CompRecommendation,
    PerformanceMetrics, AppraisalExplanations
)
from app.ml.recommendation_engine import recommendation_engine

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=AppraisalResponse)
async def get_property_recommendations(request: AppraisalRequest):
    """
    Get property recommendations for a subject property
    """
    try:
        start_time = time.time()
        
        # Get recommendations from the ML engine
        recommendations = recommendation_engine.get_recommendations(
            subject=request.subject_property,
            candidates=request.candidate_properties,
            max_distance=request.max_distance,
            max_days_since_sale=request.max_days_since_sale,
            top_k=3
        )
        
        processing_time = time.time() - start_time
        
        # Calculate confidence based on the quality of recommendations
        confidence = 0.8  # Default confidence
        if recommendations:
            avg_score = sum(rec.overall_score for rec in recommendations) / len(recommendations)
            confidence = min(1.0, max(0.3, avg_score / 100))
        
        # Create performance metrics
        performance_metrics = PerformanceMetrics(
            total_candidates=len(request.candidate_properties),
            processing_time=processing_time,
            confidence=confidence,
            model_version="1.0.0"
        )
        
        # Create explanations
        explanations = AppraisalExplanations(
            methodology="Hybrid rule-based and similarity scoring system using property characteristics, location proximity, and sale recency",
            key_factors=[
                "Gross Living Area (GLA) similarity",
                "Geographic proximity", 
                "Sale date recency",
                "Property type matching",
                "Lot size similarity",
                "Bedroom/bathroom count similarity"
            ],
            limitations=[
                "Limited to properties within specified distance and time constraints",
                "Rule-based scoring may not capture all market nuances",
                "Adjustments are based on simplified market assumptions"
            ]
        )
        
        response = AppraisalResponse(
            subject_property=request.subject_property,
            recommendations=recommendations,
            performance_metrics=performance_metrics,
            explanations=explanations
        )
        
        logger.info(f"Generated {len(recommendations)} recommendations in {processing_time:.2f}s")
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/explanation/{subject_id}/{comp_id}")
async def get_detailed_explanation(subject_id: str, comp_id: str):
    """
    Get detailed explanation for a specific subject-comp pair
    """
    # This would typically fetch from database and generate detailed explanations
    # For now, return a placeholder response
    return {
        "subject_id": subject_id,
        "comp_id": comp_id,
        "detailed_explanation": "Detailed AI-generated explanation would be provided here using LLM integration",
        "factors": [
            {
                "name": "Location Analysis",
                "score": 85,
                "explanation": "Properties are in the same neighborhood with similar access to amenities"
            },
            {
                "name": "Size Compatibility", 
                "score": 92,
                "explanation": "Living areas are within 5% of each other, indicating similar utility"
            },
            {
                "name": "Market Timing",
                "score": 78, 
                "explanation": "Sale occurred within optimal time window for market comparison"
            }
        ]
    }
