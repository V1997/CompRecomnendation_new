"""
Database models for property appraisal system
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean, ForeignKey, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Appraisal(Base):
    __tablename__ = "appraisals"
    
    id = Column(Integer, primary_key=True, index=True)
    appraisal_id = Column(String(50), unique=True, index=True)
    subject_property = Column(JSON)
    candidate_properties = Column(JSON)
    selected_comps = Column(JSON)
    appraiser_id = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(String(50), unique=True, index=True)
    address = Column(Text)
    property_type = Column(String(50))
    structure_type = Column(String(50))
    gla = Column(Integer)  # Gross Living Area
    lot_size = Column(Integer)
    bedrooms = Column(Integer)
    bathrooms = Column(Numeric(3, 1))
    year_built = Column(Integer)
    condition = Column(String(20))
    quality = Column(String(20))
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    neighborhood = Column(String(100))
    features = Column(JSON)
    sale_date = Column(DateTime)
    sale_price = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class AppraisalFeedback(Base):
    __tablename__ = "appraisal_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    appraisal_id = Column(String(50), ForeignKey("appraisals.appraisal_id"))
    recommendation_id = Column(String(50))
    user_rating = Column(Integer)
    comments = Column(Text)
    helpful = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelPerformance(Base):
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(20))
    accuracy = Column(Numeric(5, 4))
    precision = Column(Numeric(5, 4))
    recall = Column(Numeric(5, 4))
    f1_score = Column(Numeric(5, 4))
    training_date = Column(DateTime, default=datetime.utcnow)
    total_samples = Column(Integer)
    test_samples = Column(Integer)
