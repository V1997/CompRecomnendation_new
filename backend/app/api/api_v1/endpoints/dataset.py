"""
Clean API endpoints - Only optimized recommendation engine
Removed all legacy Smart Engine and Enhanced Engine code
"""
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import logging
from datetime import datetime, timedelta

from app.db.session import get_db, init_db
from app.models.database import Appraisal, Property, ModelPerformance
from app.schemas.property import SmartAppraisalRequest
from app.core.config import settings

router = APIRouter()

@router.post("/dataset/initialize/")
async def initialize_database():
    """Initialize database tables"""
    try:
        init_db()
        return {"message": "Database initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")

@router.post("/dataset/load/")
async def load_dataset_to_db(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    dataset_file: str = "data/appraisals_dataset.json"
):
    """Load appraisal dataset into database"""
    try:
        with open(dataset_file, 'r') as f:
            dataset = json.load(f)
        
        loaded_count = 0
        for appraisal_data in dataset:
            # Check if appraisal already exists
            existing = db.query(Appraisal).filter(
                Appraisal.appraisal_id == appraisal_data.get('id')
            ).first()
            
            if not existing:
                appraisal = Appraisal(
                    appraisal_id=appraisal_data.get('id'),
                    address=appraisal_data.get('address'),
                    property_type=appraisal_data.get('property_type'),
                    structure_type=appraisal_data.get('structure_type'),
                    gla=appraisal_data.get('gla'),
                    lot_size=appraisal_data.get('lot_size'),
                    bedrooms=appraisal_data.get('bedrooms'),
                    bathrooms=appraisal_data.get('bathrooms'),
                    year_built=appraisal_data.get('year_built'),
                    condition=appraisal_data.get('condition'),
                    quality=appraisal_data.get('quality'),
                    latitude=appraisal_data.get('latitude'),
                    longitude=appraisal_data.get('longitude'),
                    neighborhood=appraisal_data.get('neighborhood'),
                    features=json.dumps(appraisal_data.get('features', [])),
                    sale_price=appraisal_data.get('sale_price'),
                    sale_date=appraisal_data.get('sale_date'),
                    appraisal_date=appraisal_data.get('appraisal_date'),
                    estimated_value=appraisal_data.get('estimated_value')
                )
                
                db.add(appraisal)
                loaded_count += 1
        
        db.commit()
        return {"message": f"Loaded {loaded_count} appraisals into database"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Dataset loading failed: {str(e)}")

@router.get("/dataset/appraisals/")
async def get_appraisals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get paginated list of appraisals"""
    try:
        appraisals = db.query(Appraisal).offset(skip).limit(limit).all()
        total = db.query(Appraisal).count()
        
        return {
            "appraisals": [
                {
                    "id": app.appraisal_id,
                    "address": app.address,
                    "property_type": app.property_type,
                    "gla": app.gla,
                    "sale_price": app.sale_price,
                    "sale_date": app.sale_date
                }
                for app in appraisals
            ],
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch appraisals: {str(e)}")

@router.post("/recommendations/optimized/")
async def get_optimized_recommendations(request: SmartAppraisalRequest):
    """
    🚀 OPTIMIZED Fast recommendations using NumPy + scikit-learn only
    NO dataset loading - uses pre-computed embeddings with vectorized search
    Expected response time: 2-10ms for ALL 9,820+ properties
    """
    try:
        import time
        start_time = time.time()
        
        # Import optimized engine
        from app.ml.optimized_recommendation_engine import optimized_engine
        
        # Check if optimized engine is ready
        if not optimized_engine.is_initialized:
            raise HTTPException(
                status_code=503, 
                detail="Optimized recommendation engine not ready. Generate embeddings first: python scripts/generate_embeddings.py"
            )
        
        # Extract subject property from request - streamlined to match schema
        subject = {
            "id": request.subject_property.id,
            "address": request.subject_property.address,
            "structure_type": request.subject_property.structure_type,
            "gla": request.subject_property.gla,
            "lot_size": request.subject_property.lot_size,
            "bedrooms": request.subject_property.bedrooms,
            "bathrooms": float(request.subject_property.bathrooms),
            "year_built": request.subject_property.year_built,
            "latitude": float(request.subject_property.latitude),
            "longitude": float(request.subject_property.longitude),
            "estimated_value": request.subject_property.estimated_value,
            "sale_price": request.subject_property.estimated_value or 0
        }
        
        # Get fast recommendations using optimized engine
        optimized_response = await optimized_engine.get_fast_recommendations(
            subject_property=subject,
            top_k=3
        )
        
        # Calculate total API response time
        total_time = (time.time() - start_time) * 1000
        
        # Format response for API compatibility
        formatted_response = {
            "subject_property": optimized_response['subject_property'],
            "recommendations": [
                {
                    "property": {
                        "id": rec['property'].get('id'),
                        "address": rec['property'].get('address'),
                        "structure_type": rec['property'].get('structure_type'),
                        "gla": rec['property'].get('gla'),
                        "lot_size": rec['property'].get('lot_size'),
                        "bedrooms": rec['property'].get('bedrooms'),
                        "bathrooms": rec['property'].get('bathrooms'),
                        "year_built": rec['property'].get('year_built'),
                        "latitude": rec['property'].get('latitude'),
                        "longitude": rec['property'].get('longitude'),
                        "sale_date": rec['property'].get('close_date'),
                        "sale_price": rec['property'].get('sale_price')
                    },
                    "similarity_score": rec['similarity_score'],
                    "rank": rec['rank'],
                    "explanation": rec.get('explanation', ''),
                    "search_method": rec.get('search_method', 'optimized_vector_search')
                }
                for rec in optimized_response['recommendations']
            ],
            "metadata": {
                "total_api_response_time_ms": total_time,
                "engine_processing_time_ms": optimized_response['performance_metrics']['processing_time_ms'],
                "dataset_size": optimized_response['search_stats']['total_properties'],
                "search_method": "optimized_vector_search_only",
                "engine_type": "optimized_numpy_sklearn"
            }
        }
        
        logging.info(f"✅ Optimized recommendations completed in {total_time:.2f}ms")
        return formatted_response
        
    except Exception as e:
        import traceback
        logging.error(f"❌ Optimized recommendations failed: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Optimized recommendations failed: {str(e)}")

@router.get("/recommendations/optimized/status/")
async def get_optimized_status():
    """Get status of optimized recommendation engine"""
    try:
        from app.ml.optimized_recommendation_engine import optimized_engine
        
        status = optimized_engine.get_engine_status()
        return status
        
    except Exception as e:
        logging.error(f"Failed to get optimized engine status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")