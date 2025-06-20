from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class StructureType(str, Enum):
    DETACHED = "Detached"
    ATTACHED = "Attached"
    SEMI_DETACHED = "Semi-Detached"

class PropertyBase(BaseModel):
    address: str
    structure_type: StructureType
    gla: int = Field(..., description="Gross Living Area in square feet")
    lot_size: int = Field(..., description="Lot size in square feet")
    bedrooms: int
    bathrooms: float
    year_built: int
    latitude: float
    longitude: float

class Property(PropertyBase):
    id: str
    sale_date: Optional[datetime] = None
    sale_price: Optional[int] = None

class SubjectProperty(PropertyBase):
    id: str
    estimated_value: Optional[int] = None

class Adjustments(BaseModel):
    gla_adjustment: float = 0
    lot_size_adjustment: float = 0
    location_adjustment: float = 0
    time_adjustment: float = 0

class CompProperty(Property):
    similarity_score: float
    distance_from_subject: float
    days_since_sale: Optional[int] = None
    adjustments: Optional[Adjustments] = None

class Explanation(BaseModel):
    factor: str
    description: str
    weight: float
    contribution: float

class CompRecommendation(BaseModel):
    property: CompProperty
    rank: int
    overall_score: float
    explanations: List[Explanation]
    reasoning: str

class AppraisalRequest(BaseModel):
    subject_property: SubjectProperty
    candidate_properties: List[Property]
    max_distance: Optional[float] = 5.0
    max_days_since_sale: Optional[int] = 90

class SmartAppraisalRequest(BaseModel):
    subject_property: SubjectProperty
    max_distance: Optional[float] = 50.0
    max_days_since_sale: Optional[int] = 730

class PerformanceMetrics(BaseModel):
    total_candidates: int
    processing_time: float
    confidence: float
    model_version: str

class AppraisalExplanations(BaseModel):
    methodology: str
    key_factors: List[str]
    limitations: List[str]

class AppraisalResponse(BaseModel):
    subject_property: SubjectProperty
    recommendations: List[CompRecommendation]
    performance_metrics: PerformanceMetrics
    explanations: AppraisalExplanations

class UserFeedback(BaseModel):
    appraisal_id: str
    selected_comps: List[str]
    rejected_comps: List[str]
    comments: str
    rating: int = Field(..., ge=1, le=5)

class ModelPerformance(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    validation_results: Dict[str, Any]
