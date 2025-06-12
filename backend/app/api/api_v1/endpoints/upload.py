from fastapi import APIRouter, HTTPException, UploadFile, File
import json
import logging
from typing import List

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/appraisal-data")
async def upload_appraisal_data(file: UploadFile = File(...)):
    """
    Upload appraisal training data for model improvement
    """
    try:
        if not file.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="File must be a JSON file")
        
        content = await file.read()
        data = json.loads(content)
        
        # Validate data structure
        if not isinstance(data, list):
            raise HTTPException(status_code=400, detail="Data must be a list of appraisals")
        
        # Basic validation of appraisal structure
        required_fields = ['subject_property', 'candidate_properties', 'selected_comps']
        for i, appraisal in enumerate(data):
            for field in required_fields:
                if field not in appraisal:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Missing required field '{field}' in appraisal {i}"
                    )
        
        # In a real system, this would:
        # 1. Store the data in a database
        # 2. Queue data preprocessing
        # 3. Validate data quality
        # 4. Update training dataset
        
        logger.info(f"Uploaded {len(data)} appraisals from {file.filename}")
        
        return {
            "message": "Appraisal data uploaded successfully",
            "filename": file.filename,
            "appraisals_count": len(data),
            "status": "queued_for_processing"
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        logger.error(f"Error uploading data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload data: {str(e)}")

@router.post("/bulk-properties")
async def upload_bulk_properties(file: UploadFile = File(...)):
    """
    Upload bulk property data to expand the candidate pool
    """
    try:
        if not file.filename.endswith(('.json', '.csv')):
            raise HTTPException(status_code=400, detail="File must be JSON or CSV format")
        
        content = await file.read()
        
        if file.filename.endswith('.json'):
            data = json.loads(content)
        else:
            # Handle CSV parsing (simplified)
            import pandas as pd
            import io
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            data = df.to_dict('records')
        
        # Validate property data structure
        required_fields = ['address', 'property_type', 'gla', 'lot_size', 'bedrooms', 'bathrooms', 'year_built']
        
        if not isinstance(data, list):
            raise HTTPException(status_code=400, detail="Data must be a list of properties")
        
        valid_properties = 0
        for i, property_data in enumerate(data):
            # Check if all required fields are present
            missing_fields = [field for field in required_fields if field not in property_data]
            if not missing_fields:
                valid_properties += 1
        
        logger.info(f"Uploaded {valid_properties}/{len(data)} valid properties from {file.filename}")
        
        return {
            "message": "Property data uploaded successfully",
            "filename": file.filename,
            "total_records": len(data),
            "valid_properties": valid_properties,
            "status": "processed"
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        logger.error(f"Error uploading property data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload property data: {str(e)}")

@router.get("/data-summary")
async def get_data_summary():
    """
    Get summary of available training and property data
    """
    try:
        # In a real system, this would query the database
        # For demo, return mock summary
        
        summary = {
            "appraisal_data": {
                "total_appraisals": 1250,
                "total_properties": 8500,
                "date_range": {
                    "earliest": "2020-01-01",
                    "latest": "2024-12-01"
                },
                "geographic_coverage": {
                    "states": 15,
                    "cities": 85,
                    "neighborhoods": 450
                }
            },
            "property_data": {
                "total_properties": 45000,
                "property_types": {
                    "Single Family": 32000,
                    "Townhouse": 8000,
                    "Condominium": 4500,
                    "Multi-Family": 500
                },
                "price_range": {
                    "min": 75000,
                    "max": 2500000,
                    "median": 385000
                }
            },
            "data_quality": {
                "completeness": 0.92,
                "accuracy_score": 0.88,
                "last_updated": "2024-12-01T10:30:00Z"
            }
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Error retrieving data summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data summary: {str(e)}")
