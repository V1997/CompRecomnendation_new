import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
import lightgbm as lgb
from typing import List, Tuple, Dict, Any
import pickle
import os
from datetime import datetime, timedelta
import logging

from app.schemas.property import (
    Property, SubjectProperty, CompProperty, CompRecommendation,
    Explanation, Adjustments
)
from app.utils.similarity import calculate_distance, calculate_days_since

logger = logging.getLogger(__name__)

class PropertyRecommendationEngine:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_importance = {}
        self.is_trained = False
        
    def _prepare_features(self, properties: List[Property], subject: SubjectProperty) -> pd.DataFrame:
        """Convert properties to feature matrix"""
        features = []
        
        for prop in properties:
            # Calculate derived features
            distance = calculate_distance(
                subject.latitude, subject.longitude,
                prop.latitude, prop.longitude
            )
            
            days_since_sale = 999  # Default for properties without sale date
            if prop.sale_date:
                days_since_sale = calculate_days_since(prop.sale_date)
            
            # Feature vector
            feature_dict = {
                'gla_diff': abs(prop.gla - subject.gla),
                'gla_ratio': prop.gla / subject.gla if subject.gla > 0 else 1,
                'lot_size_diff': abs(prop.lot_size - subject.lot_size),
                'lot_size_ratio': prop.lot_size / subject.lot_size if subject.lot_size > 0 else 1,
                'bedroom_diff': abs(prop.bedrooms - subject.bedrooms),
                'bathroom_diff': abs(prop.bathrooms - subject.bathrooms),
                'age_diff': abs(prop.year_built - subject.year_built),
                'distance': distance,
                'days_since_sale': days_since_sale,
                'property_type_match': 1 if prop.property_type == subject.property_type else 0,
                'structure_type_match': 1 if prop.structure_type == subject.structure_type else 0,
                'condition_match': 1 if prop.condition == subject.condition else 0,
                'quality_match': 1 if prop.quality == subject.quality else 0,
                'sale_price': prop.sale_price or 0,
                'gla': prop.gla,
                'lot_size': prop.lot_size,
                'bedrooms': prop.bedrooms,
                'bathrooms': prop.bathrooms,
                'year_built': prop.year_built,
            }
            
            # Encode categorical features
            feature_dict['property_type'] = prop.property_type.value
            feature_dict['structure_type'] = prop.structure_type.value
            feature_dict['condition'] = prop.condition.value
            feature_dict['quality'] = prop.quality.value
            
            features.append(feature_dict)
        
        return pd.DataFrame(features)
    
    def _calculate_similarity_score(self, subject: SubjectProperty, comp: Property) -> float:
        """Calculate basic similarity score between subject and comparable property"""
        score = 100.0
        
        # GLA similarity (30% weight)
        if subject.gla > 0:
            gla_diff = abs(comp.gla - subject.gla) / subject.gla
            score -= gla_diff * 30
        
        # Lot size similarity (20% weight)
        if subject.lot_size > 0:
            lot_diff = abs(comp.lot_size - subject.lot_size) / subject.lot_size
            score -= lot_diff * 20
        
        # Bedroom similarity (15% weight)
        bedroom_diff = abs(comp.bedrooms - subject.bedrooms)
        score -= bedroom_diff * 5
        
        # Bathroom similarity (15% weight)
        bathroom_diff = abs(comp.bathrooms - subject.bathrooms)
        score -= bathroom_diff * 7.5
        
        # Age similarity (10% weight)
        age_diff = abs(comp.year_built - subject.year_built) / 10
        score -= min(age_diff, 10)
        
        # Property type match (10% weight)
        if comp.property_type != subject.property_type:
            score -= 10
        
        return max(0, min(100, score))
    
    def _calculate_adjustments(self, subject: SubjectProperty, comp: Property) -> Adjustments:
        """Calculate price adjustments for comparable property"""
        adjustments = Adjustments()
        
        # GLA adjustment ($50 per sq ft difference)
        adjustments.gla_adjustment = (comp.gla - subject.gla) * 50
        
        # Lot size adjustment ($5 per sq ft difference)
        adjustments.lot_size_adjustment = (comp.lot_size - subject.lot_size) * 5
        
        # Condition adjustment
        condition_values = {"Poor": -10000, "Fair": -5000, "Average": 0, "Good": 5000, "Excellent": 10000}
        subject_condition_value = condition_values.get(subject.condition.value, 0)
        comp_condition_value = condition_values.get(comp.condition.value, 0)
        adjustments.condition_adjustment = comp_condition_value - subject_condition_value
        
        # Location adjustment (distance-based)
        distance = calculate_distance(
            subject.latitude, subject.longitude,
            comp.latitude, comp.longitude
        )
        if distance > 1:
            adjustments.location_adjustment = -2000 * (distance - 1)
        
        # Time adjustment (for sales older than 90 days)
        if comp.sale_date:
            days_since_sale = calculate_days_since(comp.sale_date)
            if days_since_sale > 90:
                adjustments.time_adjustment = -3000 * ((days_since_sale - 90) / 30)
        
        return adjustments
    
    def _generate_explanations(self, subject: SubjectProperty, comp: Property, score: float) -> List[Explanation]:
        """Generate explanations for why a property is a good/bad comparable"""
        explanations = []
        
        distance = calculate_distance(
            subject.latitude, subject.longitude,
            comp.latitude, comp.longitude
        )
        
        days_since_sale = 999
        if comp.sale_date:
            days_since_sale = calculate_days_since(comp.sale_date)
        
        # GLA Similarity
        gla_diff = abs(comp.gla - subject.gla)
        gla_contribution = max(0, (1 - gla_diff / subject.gla) * 30) if subject.gla > 0 else 0
        explanations.append(Explanation(
            factor="GLA Similarity",
            description=f"{gla_diff} sq ft difference",
            weight=0.3,
            contribution=gla_contribution
        ))
        
        # Location Proximity
        location_contribution = max(0, (2 - distance) / 2 * 25)
        explanations.append(Explanation(
            factor="Location Proximity",
            description=f"{distance:.2f} miles away",
            weight=0.25,
            contribution=location_contribution
        ))
        
        # Sale Recency
        recency_contribution = max(0, (90 - days_since_sale) / 90 * 20) if days_since_sale <= 90 else 0
        explanations.append(Explanation(
            factor="Sale Recency",
            description=f"Sold {days_since_sale} days ago",
            weight=0.2,
            contribution=recency_contribution
        ))
        
        # Property Type Match
        type_contribution = 15 if comp.property_type == subject.property_type else 0
        explanations.append(Explanation(
            factor="Property Type Match",
            description="Exact match" if comp.property_type == subject.property_type else "Different type",
            weight=0.15,
            contribution=type_contribution
        ))
        
        # Lot Size Similarity
        lot_diff = abs(comp.lot_size - subject.lot_size)
        lot_contribution = max(0, (1 - lot_diff / subject.lot_size) * 10) if subject.lot_size > 0 else 0
        explanations.append(Explanation(
            factor="Lot Size Similarity",
            description=f"{lot_diff} sq ft difference",
            weight=0.1,
            contribution=lot_contribution
        ))
        
        return explanations
    
    def get_recommendations(
        self, 
        subject: SubjectProperty, 
        candidates: List[Property],
        max_distance: float = 5.0,
        max_days_since_sale: int = 90,
        top_k: int = 3
    ) -> List[CompRecommendation]:
        """Get top K property recommendations"""
        
        # Filter candidates by basic criteria
        filtered_candidates = []
        for prop in candidates:
            distance = calculate_distance(
                subject.latitude, subject.longitude,
                prop.latitude, prop.longitude
            )
            
            days_since_sale = 999
            if prop.sale_date:
                days_since_sale = calculate_days_since(prop.sale_date)
            
            # Apply filters
            if distance <= max_distance and days_since_sale <= max_days_since_sale:
                filtered_candidates.append(prop)
        
        if not filtered_candidates:
            return []
        
        # Calculate scores and create recommendations
        recommendations = []
        for prop in filtered_candidates:
            # Calculate similarity score
            similarity_score = self._calculate_similarity_score(subject, prop)
            
            # Calculate distance and days since sale
            distance = calculate_distance(
                subject.latitude, subject.longitude,
                prop.latitude, prop.longitude
            )
            
            days_since_sale = 999
            if prop.sale_date:
                days_since_sale = calculate_days_since(prop.sale_date)
            
            # Calculate adjustments
            adjustments = self._calculate_adjustments(subject, prop)
            
            # Create CompProperty
            comp_property = CompProperty(
                **prop.dict(),
                similarity_score=similarity_score,
                distance_from_subject=distance,
                days_since_sale=days_since_sale if days_since_sale < 999 else None,
                adjustments=adjustments
            )
            
            # Calculate overall score (weighted combination)
            overall_score = similarity_score - (distance * 5) - (days_since_sale * 0.1)
            
            # Generate explanations
            explanations = self._generate_explanations(subject, prop, overall_score)
            
            # Generate reasoning
            reasoning = f"This property is a {similarity_score:.0f}% match based on similar living area " \
                       f"({prop.gla} vs {subject.gla} sq ft), proximity ({distance:.1f} miles), " \
                       f"and recent sale date ({days_since_sale} days ago)."
            
            recommendation = CompRecommendation(
                property=comp_property,
                rank=0,  # Will be set after sorting
                overall_score=overall_score,
                explanations=explanations,
                reasoning=reasoning
            )
            
            recommendations.append(recommendation)
        
        # Sort by overall score and take top K
        recommendations.sort(key=lambda x: x.overall_score, reverse=True)
        recommendations = recommendations[:top_k]
        
        # Set ranks
        for i, rec in enumerate(recommendations):
            rec.rank = i + 1
        
        return recommendations
    
    def train_model(self, training_data: pd.DataFrame):
        """Train the ML model (placeholder for future implementation)"""
        # This would be implemented with actual training data
        logger.info("Model training not yet implemented - using rule-based system")
        self.is_trained = True
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        model_data = {
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_importance': self.feature_importance,
            'is_trained': self.is_trained
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
                
            self.scaler = model_data['scaler']
            self.label_encoders = model_data['label_encoders']
            self.feature_importance = model_data['feature_importance']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"Model loaded from {filepath}")
        else:
            logger.warning(f"Model file not found: {filepath}")

# Global instance
recommendation_engine = PropertyRecommendationEngine()
