"""
Enhanced ML recommendation engine that learns from historical appraisal data
"""
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support
import joblib
import pickle
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import logging

class EnhancedRecommendationEngine:
    def __init__(self):
        self.similarity_model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight='balanced'
        )
        self.value_model = GradientBoostingRegressor(
            n_estimators=100,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.is_trained = False
        self.model_version = "2.0.0"
        
    def extract_features(self, subject: Dict, candidate: Dict) -> np.array:
        """Extract comprehensive features for ML model"""
        
        features = []
        
        # 1. Numerical similarity features
        # GLA difference (normalized)
        gla_diff = abs(subject.get('gla', 0) - candidate.get('gla', 0)) / max(subject.get('gla', 1), 1)
        features.append(gla_diff)
        
        # Lot size difference (normalized)
        lot_diff = abs(subject.get('lot_size', 0) - candidate.get('lot_size', 0)) / max(subject.get('lot_size', 1), 1)
        features.append(lot_diff)
        
        # Bedroom difference
        bed_diff = abs((subject.get('bedrooms') or 0) - (candidate.get('bedrooms') or 0))
        features.append(bed_diff)
        
        # Bathroom difference
        bath_diff = abs((subject.get('bathrooms') or 0) - (candidate.get('bathrooms') or 0))
        features.append(bath_diff)
        
        # Year built difference
        year_diff = abs((subject.get('year_built') or 0) - (candidate.get('year_built') or 0))
        features.append(year_diff)
        
        # 2. Location features
        # Geographic distance (simplified)
        lat_diff = abs((subject.get('latitude') or 0) - (candidate.get('latitude') or 0))
        lng_diff = abs((subject.get('longitude') or 0) - (candidate.get('longitude') or 0))
        geo_distance = np.sqrt(lat_diff**2 + lng_diff**2)
        features.append(geo_distance)
        
        # Same neighborhood
        same_neighborhood = 1 if subject.get('neighborhood') == candidate.get('neighborhood') else 0
        features.append(same_neighborhood)
        
        # 3. Property type features
        same_property_type = 1 if subject.get('property_type') == candidate.get('property_type') else 0
        features.append(same_property_type)
        
        same_structure_type = 1 if subject.get('structure_type') == candidate.get('structure_type') else 0
        features.append(same_structure_type)
        
        # 4. Condition and quality features
        # Convert condition/quality to numerical
        condition_map = {'Poor': 1, 'Fair': 2, 'Average': 3, 'Good': 4, 'Excellent': 5}
        subject_condition = condition_map.get(subject.get('condition', 'Average'), 3)
        candidate_condition = condition_map.get(candidate.get('condition', 'Average'), 3)
        condition_diff = abs(subject_condition - candidate_condition)
        features.append(condition_diff)
        
        subject_quality = condition_map.get(subject.get('quality', 'Average'), 3)
        candidate_quality = condition_map.get(candidate.get('quality', 'Average'), 3)
        quality_diff = abs(subject_quality - candidate_quality)
        features.append(quality_diff)
        
        # 5. Features overlap
        subject_features = set(subject.get('features', []))
        candidate_features = set(candidate.get('features', []))
        feature_overlap = len(subject_features.intersection(candidate_features))
        feature_total = len(subject_features.union(candidate_features))
        feature_similarity = feature_overlap / max(feature_total, 1)
        features.append(feature_similarity)
        
        # 6. Time features (for candidate)
        try:
            sale_date = datetime.fromisoformat(candidate.get('sale_date', '').replace('Z', '+00:00'))
            appraisal_date = datetime.fromisoformat(subject.get('appraisal_date', '').replace('Z', '+00:00'))
            days_since_sale = (appraisal_date - sale_date).days
            features.append(days_since_sale)
            
            # Sale recency score
            recency_score = max(0, 1 - days_since_sale / 365)
            features.append(recency_score)
        except:
            features.extend([365, 0])  # Default values
        
        # 7. Price-related features
        candidate_price = candidate.get('sale_price') or 0
        subject_value = subject.get('estimated_value') or 0
        if subject_value > 0:
            price_ratio = candidate_price / subject_value
            features.append(price_ratio)
        else:
            features.append(1.0)
        
        # Price per sq ft
        candidate_gla = candidate.get('gla') or 1
        if candidate_gla > 0:
            price_per_sqft = candidate_price / candidate_gla
            features.append(price_per_sqft)
        else:
            features.append(0)
        
        return np.array(features)
    
    def prepare_training_data(self, dataset_path: str) -> Tuple[np.array, np.array]:
        """Prepare training data from appraisals dataset"""
        
        try:
            with open(dataset_path, 'r') as f:
                dataset = json.load(f)
        except FileNotFoundError:
            # Production uses real dataset only - no fallback to sample data
            logging.error(f"Real dataset {dataset_path} not found. Cannot proceed without real appraisal data.")
            raise FileNotFoundError(f"Production dataset {dataset_path} is required for ML training")
        
        X, y = [], []
        
        for appraisal in dataset:
            subject = appraisal.get('subject_property', {})
            candidates = appraisal.get('candidate_properties', [])
            selected = appraisal.get('selected_comps', [])
            selected_ids = {comp.get('id') for comp in selected}
            
            for candidate in candidates:
                try:
                    features = self.extract_features(subject, candidate)
                    label = 1 if candidate.get('id') in selected_ids else 0
                    
                    X.append(features)
                    y.append(label)
                except Exception as e:
                    logging.warning(f"Error processing candidate {candidate.get('id', 'unknown')}: {e}")
                    continue
        
        return np.array(X), np.array(y)
    
    def train(self, dataset_path: str = "data/appraisals_dataset.json") -> Dict[str, float]:
        """Train the enhanced recommendation model"""
        
        logging.info("Preparing training data...")
        X, y = self.prepare_training_data(dataset_path)
        
        if len(X) == 0:
            raise ValueError("No training data available")
        
        logging.info(f"Training with {len(X)} samples, {sum(y)} positive examples")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train similarity model
        self.similarity_model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.similarity_model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
        
        # Cross-validation
        cv_scores = cross_val_score(self.similarity_model, X_train_scaled, y_train, cv=5)
        
        self.is_trained = True
        
        metrics = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'cv_mean': float(cv_scores.mean()),
            'cv_std': float(cv_scores.std()),
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
        
        logging.info(f"Model trained successfully: {metrics}")
        return metrics
    
    def predict_similarity(self, subject: Dict, candidate: Dict) -> float:
        """Predict similarity score using trained model"""
        
        if not self.is_trained:
            # Fallback to rule-based scoring
            return self._rule_based_similarity(subject, candidate)
        
        try:
            features = self.extract_features(subject, candidate).reshape(1, -1)
            features_scaled = self.scaler.transform(features)
            
            # Get probability of being selected as comp
            prob = self.similarity_model.predict_proba(features_scaled)[0][1]
            return float(prob * 100)  # Convert to percentage
            
        except Exception as e:
            logging.warning(f"Error in ML prediction, falling back to rule-based: {e}")
            return self._rule_based_similarity(subject, candidate)
    
    def _rule_based_similarity(self, subject: Dict, candidate: Dict) -> float:
        """Fallback rule-based similarity calculation"""
        
        score = 0
        
        # GLA similarity (30%)
        gla_diff = abs(subject.get('gla', 0) - candidate.get('gla', 0)) / max(subject.get('gla', 1), 1)
        score += (1 - min(gla_diff, 1)) * 30
        
        # Location (25%)
        if subject.get('neighborhood') == candidate.get('neighborhood'):
            score += 25
        
        # Property type (20%)
        if subject.get('property_type') == candidate.get('property_type'):
            score += 20
        
        # Bedrooms/bathrooms (15%)
        bed_diff = abs((subject.get('bedrooms') or 0) - (candidate.get('bedrooms') or 0))
        bath_diff = abs((subject.get('bathrooms') or 0) - (candidate.get('bathrooms') or 0))
        room_score = max(0, 15 - (bed_diff + bath_diff) * 3)
        score += room_score
        
        # Sale recency (10%)
        try:
            sale_date = datetime.fromisoformat(candidate.get('sale_date', '').replace('Z', '+00:00'))
            days_ago = (datetime.now() - sale_date).days
            if days_ago is not None:
                recency_score = max(0, 10 - days_ago / 36.5)  # Decay over ~1 year
                score += recency_score
        except Exception as e:
            # If date parsing fails, skip recency scoring
            logging.debug(f"Could not parse sale date for recency scoring: {e}")
            pass
        
        return min(100, max(0, score))
    
    def save_model(self, model_dir: str = "models/"):
        """Save trained model to disk"""
        import os
        os.makedirs(model_dir, exist_ok=True)
        
        joblib.dump(self.similarity_model, f"{model_dir}/similarity_model.pkl")
        joblib.dump(self.scaler, f"{model_dir}/feature_scaler.pkl")
        
        # Save metadata
        metadata = {
            'model_version': self.model_version,
            'is_trained': self.is_trained,
            'feature_count': len(self.extract_features({}, {})),
            'saved_at': datetime.now().isoformat()
        }
        
        with open(f"{model_dir}/model_metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logging.info(f"Model saved to {model_dir}")
    
    def load_model(self, model_dir: str = "models/"):
        """Load trained model from disk"""
        try:
            self.similarity_model = joblib.load(f"{model_dir}/similarity_model.pkl")
            self.scaler = joblib.load(f"{model_dir}/feature_scaler.pkl")
            
            with open(f"{model_dir}/model_metadata.json", 'r') as f:
                metadata = json.load(f)
                self.model_version = metadata.get('model_version', '2.0.0')
                self.is_trained = metadata.get('is_trained', False)
            
            logging.info(f"Model loaded from {model_dir}")
            return True
            
        except Exception as e:
            logging.warning(f"Could not load model: {e}")
            return False

# Global instance
enhanced_engine = EnhancedRecommendationEngine()
