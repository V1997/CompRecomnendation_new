"""
API endpoints for appraisal dataset management and model training
"""
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import logging
from datetime import datetime, timedelta

from app.db.session import get_db, init_db
from app.models.database import Appraisal, Property, ModelPerformance
from app.ml.enhanced_recommendation_engine import enhanced_engine
from app.schemas.property import AppraisalRequest, AppraisalResponse, SmartAppraisalRequest
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

# Removed deprecated sample dataset generation endpoint - production uses real data only

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
                    subject_property=appraisal_data.get('subject_property'),
                    candidate_properties=appraisal_data.get('candidate_properties'),
                    selected_comps=appraisal_data.get('selected_comps'),
                    appraiser_id=appraisal_data.get('appraiser_id', 'unknown')
                )
                db.add(appraisal)
                loaded_count += 1
        
        db.commit()
        
        return {
            "message": f"Loaded {loaded_count} new appraisals into database",
            "total_processed": len(dataset),
            "new_records": loaded_count
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Dataset file {dataset_file} not found")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Dataset loading failed: {str(e)}")

@router.get("/dataset/appraisals/")
async def get_appraisals(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get appraisals from database"""
    try:
        appraisals = db.query(Appraisal).offset(skip).limit(limit).all()
        total = db.query(Appraisal).count()
        
        result = []
        for appraisal in appraisals:
            result.append({
                "id": appraisal.id,
                "appraisal_id": appraisal.appraisal_id,
                "subject_property": appraisal.subject_property,
                "candidate_properties": appraisal.candidate_properties,
                "selected_comps": appraisal.selected_comps,
                "appraiser_id": appraisal.appraiser_id,
                "created_at": appraisal.created_at.isoformat() if appraisal.created_at else None
            })
        
        return {
            "appraisals": result,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve appraisals: {str(e)}")

@router.get("/dataset/appraisals/{appraisal_id}")
async def get_appraisal(appraisal_id: str, db: Session = Depends(get_db)):
    """Get specific appraisal by ID"""
    try:
        appraisal = db.query(Appraisal).filter(
            Appraisal.appraisal_id == appraisal_id
        ).first()
        
        if not appraisal:
            raise HTTPException(status_code=404, detail="Appraisal not found")
        
        return {
            "id": appraisal.id,
            "appraisal_id": appraisal.appraisal_id,
            "subject_property": appraisal.subject_property,
            "candidate_properties": appraisal.candidate_properties,
            "selected_comps": appraisal.selected_comps,
            "appraiser_id": appraisal.appraiser_id,
            "created_at": appraisal.created_at.isoformat() if appraisal.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve appraisal: {str(e)}")

@router.post("/model/train/")
async def train_enhanced_model(
    background_tasks: BackgroundTasks,
    dataset_file: str = "../sample_appraisals_dataset.json",
    db: Session = Depends(get_db)
):
    """Train the enhanced ML recommendation model"""
    try:
        # Train the model
        metrics = enhanced_engine.train(dataset_file)
        
        # Save model
        enhanced_engine.save_model()
        
        # Store performance metrics in database
        performance = ModelPerformance(
            model_version=enhanced_engine.model_version,
            accuracy=metrics['accuracy'],
            precision=metrics['precision'],
            recall=metrics['recall'],
            f1_score=metrics['f1_score'],
            total_samples=metrics['training_samples'],
            test_samples=metrics['test_samples']
        )
        db.add(performance)
        db.commit()
        
        return {
            "message": "Model trained successfully",
            "model_version": enhanced_engine.model_version,
            "metrics": metrics,
            "is_trained": enhanced_engine.is_trained
        }
        
    except Exception as e:
        logging.error(f"Model training failed: {e}")
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/model/status/")
async def get_model_status():
    """Get current model status"""
    try:
        # Try to load existing model
        if not enhanced_engine.is_trained:
            enhanced_engine.load_model()
        
        return {
            "model_version": enhanced_engine.model_version,
            "is_trained": enhanced_engine.is_trained,
            "model_type": "Enhanced ML + Rule-based hybrid"
        }
        
    except Exception as e:
        return {
            "model_version": enhanced_engine.model_version,
            "is_trained": False,
            "error": str(e),
            "model_type": "Rule-based fallback"
        }

@router.get("/model/performance/")
async def get_model_performance(db: Session = Depends(get_db)):
    """Get model performance history"""
    try:
        performances = db.query(ModelPerformance).order_by(
            ModelPerformance.training_date.desc()
        ).limit(10).all()
        
        result = []
        for perf in performances:
            result.append({
                "id": perf.id,
                "model_version": perf.model_version,
                "accuracy": float(perf.accuracy) if perf.accuracy else 0,
                "precision": float(perf.precision) if perf.precision else 0,
                "recall": float(perf.recall) if perf.recall else 0,
                "f1_score": float(perf.f1_score) if perf.f1_score else 0,
                "training_date": perf.training_date.isoformat() if perf.training_date else None,
                "total_samples": perf.total_samples,
                "test_samples": perf.test_samples
            })
        
        return {"performance_history": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve performance data: {str(e)}")

@router.post("/recommendations/enhanced/")
async def get_enhanced_recommendations(request: AppraisalRequest):
    """Get recommendations using enhanced ML model"""
    try:
        import time
        start_time = time.time()
        
        # Ensure model is loaded
        if not enhanced_engine.is_trained:
            enhanced_engine.load_model()
        
        # Convert request to internal format
        subject = {
            "id": request.subject_property.id,
            "address": request.subject_property.address,
            "property_type": request.subject_property.property_type,
            "structure_type": request.subject_property.structure_type,
            "gla": request.subject_property.gla,
            "lot_size": request.subject_property.lot_size,
            "bedrooms": request.subject_property.bedrooms,
            "bathrooms": float(request.subject_property.bathrooms),
            "year_built": request.subject_property.year_built,
            "condition": request.subject_property.condition,
            "quality": request.subject_property.quality,
            "latitude": float(request.subject_property.latitude),
            "longitude": float(request.subject_property.longitude),
            "neighborhood": request.subject_property.neighborhood,
            "features": request.subject_property.features or [],
            "appraisal_date": request.subject_property.appraisal_date,
            "estimated_value": request.subject_property.estimated_value
        }
        
        candidates = []
        for prop in request.candidate_properties:
            candidates.append({
                "id": prop.id,
                "address": prop.address,
                "property_type": prop.property_type,
                "structure_type": prop.structure_type,
                "gla": prop.gla,
                "lot_size": prop.lot_size,
                "bedrooms": prop.bedrooms,
                "bathrooms": float(prop.bathrooms),
                "year_built": prop.year_built,
                "condition": prop.condition,
                "quality": prop.quality,
                "latitude": float(prop.latitude),
                "longitude": float(prop.longitude),
                "neighborhood": prop.neighborhood,
                "features": prop.features or [],
                "sale_date": prop.sale_date,
                "sale_price": prop.sale_price
            })
        
        # Get ML-based recommendations
        scored_candidates = []
        for candidate in candidates:
            similarity_score = enhanced_engine.predict_similarity(subject, candidate)
            
            # Use a default threshold of 60 if not provided
            threshold = 60.0
            if similarity_score >= threshold:
                scored_candidates.append({
                    "candidate": candidate,
                    "similarity_score": similarity_score
                })
        
        # Sort by similarity score
        scored_candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        # Format response
        recommendations = []
        for i, item in enumerate(scored_candidates[:10]):  # Top 10
            candidate = item["candidate"]
            score = item["similarity_score"]
            
            recommendations.append({
                "property": candidate,
                "rank": i + 1,
                "overall_score": score,
                "explanations": [
                    {
                        "factor": "ML Similarity Score",
                        "description": f"Machine learning model confidence: {score:.1f}%",
                        "weight": 1.0,
                        "contribution": score
                    }
                ],
                "reasoning": f"Enhanced ML model identified this as a {score:.1f}% match based on learned patterns from historical appraisal data."
            })
        
        processing_time = time.time() - start_time
        
        return {
            "subject_property": subject,
            "recommendations": recommendations,
            "performance_metrics": {
                "total_candidates": len(candidates),
                "processing_time": processing_time,
                "confidence": np.mean([r["overall_score"] for r in recommendations]) / 100 if recommendations else 0,
                "model_version": enhanced_engine.model_version,
                "model_type": "Enhanced ML" if enhanced_engine.is_trained else "Rule-based"
            },
            "explanations": {
                "methodology": "Enhanced machine learning model trained on historical appraisal data",
                "key_factors": [
                    "Historical appraiser selections",
                    "Property characteristic similarity",
                    "Geographic proximity",
                    "Sale recency and market conditions"
                ],
                "limitations": [
                    "Performance depends on training data quality",
                    "May not capture all market nuances",
                    "Requires periodic retraining"
                ]
            }
        }
        
    except Exception as e:
        logging.error(f"Enhanced recommendations failed: {e}")
        raise HTTPException(status_code=500, detail=f"Enhanced recommendations failed: {str(e)}")

@router.post("/recommendations/smart/")
async def get_smart_recommendations(request: SmartAppraisalRequest):
    """Get recommendations by automatically finding candidates from dataset"""
    try:
        import time
        import math
        start_time = time.time()
        
        # Load real dataset to find candidate properties
        dataset_file = "data/appraisals_dataset.json"
        try:
            with open(dataset_file, 'r') as f:
                dataset_raw = json.load(f)
                dataset = dataset_raw.get('appraisals', [])
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Real dataset file not found")
        
        # Extract subject property
        subject = {
            "id": request.subject_property.id,
            "address": request.subject_property.address,
            "property_type": request.subject_property.property_type,
            "structure_type": request.subject_property.structure_type,
            "gla": request.subject_property.gla,
            "lot_size": request.subject_property.lot_size,
            "bedrooms": request.subject_property.bedrooms,
            "bathrooms": float(request.subject_property.bathrooms),
            "year_built": request.subject_property.year_built,
            "condition": request.subject_property.condition,
            "quality": request.subject_property.quality,
            "latitude": float(request.subject_property.latitude),
            "longitude": float(request.subject_property.longitude),
            "neighborhood": request.subject_property.neighborhood,
            "features": request.subject_property.features or [],
            "appraisal_date": request.subject_property.appraisal_date,
            "estimated_value": request.subject_property.estimated_value
        }
        
        # Find candidate properties from dataset
        candidates = []
        max_distance = request.max_distance  # Use from request
        max_days_since_sale = request.max_days_since_sale  # Use from request
        
        def calculate_distance(lat1, lon1, lat2, lon2):
            """Calculate distance between two points in miles"""
            R = 3959  # Earth's radius in miles
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = (math.sin(dlat/2) * math.sin(dlat/2) + 
                 math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
                 math.sin(dlon/2) * math.sin(dlon/2))
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return R * c
        
        def days_since_sale(sale_date_str):
            """Calculate days since sale - handles real dataset date formats"""
            try:
                from datetime import datetime
                # Try different date formats from real dataset
                if sale_date_str:
                    # Handle YYYY-MM-DD format
                    if '-' in sale_date_str:
                        sale_date = datetime.fromisoformat(sale_date_str.replace('Z', '+00:00'))
                    else:
                        # Handle other formats if needed
                        sale_date = datetime.strptime(sale_date_str, '%Y-%m-%d')
                    return (datetime.now(sale_date.tzinfo if sale_date.tzinfo else None) - sale_date).days
                return 365  # Default to 1 year if no date
            except Exception as e:
                logging.warning(f"Failed to parse date {sale_date_str}: {e}")
                return 365  # Default to 1 year if parsing fails
        
        # Extract candidates from all appraisals in real dataset
        for appraisal in dataset:
            # Get candidates from the properties pool
            if 'properties' in appraisal:
                for prop in appraisal['properties']:
                    try:
                        # Map real dataset fields to our schema (using actual field names from analysis)
                        candidate = {
                            'id': f"real_{prop.get('property_id', hash(prop.get('address', '')))}",
                            'address': prop.get('address', ''),
                            'property_type': prop.get('type', 'Detached'),
                            'structure_type': prop.get('type', 'Detached'),
                            'gla': int(prop.get('gla', 0)) if prop.get('gla') else 0,
                            'lot_size': float(prop.get('lot_size', 0)) if prop.get('lot_size') else 0,
                            'bedrooms': int(prop.get('bedrooms', 0)) if prop.get('bedrooms') else 0,
                            'bathrooms': 1.0,  # Default since not consistently in real dataset
                            'year_built': int(prop.get('year_built', 1980)) if prop.get('year_built') else 1980,
                            'condition': 'Average',  # Default since not consistent in real dataset
                            'quality': 'Average',
                            'latitude': float(prop.get('latitude', 44.2312)) if prop.get('latitude') else 44.2312,  # Kingston default
                            'longitude': float(prop.get('longitude', -76.4860)) if prop.get('longitude') else -76.4860,
                            'neighborhood': 'Kingston',  # Default for real dataset
                            'features': [],
                            'sale_date': prop.get('close_date', '2024-01-01'),
                            'sale_price': float(prop.get('close_price', 0)) if prop.get('close_price') else 0
                        }
                        
                        # Skip if essential data is missing
                        if not candidate['address'] or candidate['sale_price'] <= 0:
                            continue
                        
                        # Calculate distance
                        distance = calculate_distance(
                            subject['latitude'], subject['longitude'],
                            candidate['latitude'], candidate['longitude']
                        )
                        
                        # Calculate days since sale
                        days_since = days_since_sale(candidate['sale_date'])
                        
                        # Apply filters
                        if distance <= max_distance and days_since <= max_days_since_sale:
                            # Add calculated fields
                            candidate['distance_from_subject'] = distance
                            candidate['days_since_sale'] = days_since
                            candidates.append(candidate)
                        
                    except (KeyError, ValueError, TypeError) as e:
                        # Skip malformed candidates
                        continue
        
        # Remove duplicates based on address
        seen_addresses = set()
        unique_candidates = []
        for candidate in candidates:
            if candidate['address'] not in seen_addresses:
                seen_addresses.add(candidate['address'])
                unique_candidates.append(candidate)
        
        # Limit to top 50 candidates for performance
        candidates = unique_candidates[:50]
        
        logging.info(f"Found {len(candidates)} candidate properties for {subject['address']}")
        
        # Ensure model is loaded
        if not enhanced_engine.is_trained:
            enhanced_engine.load_model()
        
        # Get ML-based recommendations
        scored_candidates = []
        for candidate in candidates:
            try:
                similarity_score = enhanced_engine.predict_similarity(subject, candidate)
                
                # Use a threshold of 50% for more results
                threshold = 50.0
                if similarity_score >= threshold:
                    scored_candidates.append({
                        "candidate": candidate,
                        "similarity_score": similarity_score
                    })
            except Exception as e:
                logging.warning(f"Failed to score candidate {candidate.get('id', 'unknown')}: {e}")
                continue
        
        # Sort by similarity score
        scored_candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        # Format response - limit to top 10
        recommendations = []
        for i, item in enumerate(scored_candidates[:10]):
            candidate = item["candidate"]
            score = item["similarity_score"]
            
            recommendations.append({
                "property": candidate,
                "rank": i + 1,
                "overall_score": score,
                "explanations": [
                    {
                        "factor": "ML Similarity Score",
                        "description": f"Machine learning model confidence: {score:.1f}%",
                        "weight": 1.0,
                        "contribution": score
                    },
                    {
                        "factor": "Geographic Proximity", 
                        "description": f"Distance: {candidate.get('distance_from_subject', 0):.1f} miles",
                        "weight": 0.3,
                        "contribution": max(0, 100 - candidate.get('distance_from_subject', 0) * 2)
                    },
                    {
                        "factor": "Sale Recency",
                        "description": f"Sold {candidate.get('days_since_sale', 0)} days ago",
                        "weight": 0.2,
                        "contribution": max(0, 100 - candidate.get('days_since_sale', 0) / 7.3)
                    }
                ],
                "reasoning": f"Smart ML model identified this as a {score:.1f}% match. Located {candidate.get('distance_from_subject', 0):.1f} miles away, sold {candidate.get('days_since_sale', 0)} days ago."
            })
        
        processing_time = time.time() - start_time
        
        return {
            "subject_property": subject,
            "recommendations": recommendations,
            "performance_metrics": {
                "total_candidates": len(candidates),
                "qualified_candidates": len(scored_candidates), 
                "processing_time": processing_time,
                "confidence": np.mean([r["overall_score"] for r in recommendations]) / 100 if recommendations else 0,
                "model_version": enhanced_engine.model_version,
                "model_type": "Smart ML with Real Canadian Dataset Mining"
            },
            "explanations": {
                "methodology": "Smart recommendation engine that mines 88 real Canadian appraisals with 9,820+ properties from Kingston, Ontario",
                "key_factors": [
                    "Geographic proximity filtering",
                    "Sale recency filtering", 
                    "ML similarity scoring",
                    "Property characteristic matching"
                ],
                "limitations": [
                    "Limited to available dataset properties",
                    "Distance and time filters may exclude good matches",
                    "Performance depends on dataset quality"
                ]
            }
        }
        
    except Exception as e:
        logging.error(f"Smart recommendations failed: {e}")
        raise HTTPException(status_code=500, detail=f"Smart recommendations failed: {str(e)}")

# Add numpy import at the top
import numpy as np
