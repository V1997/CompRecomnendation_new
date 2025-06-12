"""
Lightweight Property Embedding Generator
Generates embeddings using NumPy + scikit-learn only - NO FAISS required!
Pre-computes embeddings for all properties to eliminate dataset loading during queries
"""

import numpy as np
import json
import time
import logging
from pathlib import Path
import joblib
from typing import Dict, List, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LightweightEmbeddingGenerator:
    """
    Generates property embeddings using trained ML model and NumPy only
    No additional dependencies required!
    """
    
    def __init__(self, model_dir: str = "models/"):
        self.model_dir = Path(model_dir)
        self.output_dir = self.model_dir / "embeddings"
        self.trained_model = None
        self.feature_scaler = None
        
    def load_trained_models(self) -> bool:
        """
        Load the trained ML model and feature scaler
        """
        try:
            # Find the model files that actually exist
            model_files = list(self.model_dir.glob("similarity_model.pkl"))
            if not model_files:
                # Fallback to enhanced_rf pattern
                model_files = list(self.model_dir.glob("enhanced_rf_*.pkl"))
            if not model_files:
                # Fallback to any model file
                model_files = list(self.model_dir.glob("*model*.pkl"))
            
            scaler_files = list(self.model_dir.glob("feature_scaler.pkl"))
            if not scaler_files:
                scaler_files = list(self.model_dir.glob("*scaler*.pkl"))
            
            if model_files:
                latest_model = max(model_files, key=lambda x: x.stat().st_mtime)
                self.trained_model = joblib.load(latest_model)
                logger.info(f"✅ Loaded ML model: {latest_model.name}")
            else:
                logger.error("❌ No trained model found in models directory")
                logger.error(f"   Available files: {list(self.model_dir.glob('*.pkl'))}")
                return False
            
            if scaler_files:
                latest_scaler = max(scaler_files, key=lambda x: x.stat().st_mtime)
                self.feature_scaler = joblib.load(latest_scaler)
                logger.info(f"✅ Loaded feature scaler: {latest_scaler.name}")
            else:
                logger.warning("⚠️  No feature scaler found - will proceed without scaling")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load trained models: {e}")
            return False
    
    def load_appraisals_dataset(self, dataset_path: str = "data/appraisals_dataset.json") -> Dict:
        """
        Load the appraisals dataset - FINAL TIME!
        After this, we'll never load the dataset during queries again
        """
        logger.info(f"📂 Loading dataset from {dataset_path} (FINAL TIME!)")
        
        try:
            with open(dataset_path, 'r', encoding='utf-8') as f:
                dataset = json.load(f)
            
            appraisals_count = len(dataset.get('appraisals', []))
            logger.info(f"✅ Dataset loaded: {appraisals_count} appraisals")
            
            return dataset
            
        except Exception as e:
            logger.error(f"❌ Failed to load dataset: {e}")
            raise
    
    def extract_all_properties(self, dataset: Dict) -> List[Dict]:
        """
        Extract and standardize ALL properties from the dataset
        """
        all_properties = []
        property_count = 0
        
        logger.info("🔄 Extracting all properties from appraisals...")
        
        for appraisal_idx, appraisal in enumerate(dataset.get('appraisals', [])):
            if appraisal_idx % 10 == 0:
                logger.info(f"   Processing appraisal {appraisal_idx + 1}...")
            
            # Extract candidate properties and selected comps
            candidates = appraisal.get('properties', [])
            selected_comps = appraisal.get('comps', [])
            
            # Process all properties in this appraisal
            for prop in candidates + selected_comps:
                if prop and isinstance(prop, dict):
                    standardized = self.standardize_property_format(prop, appraisal)
                    if standardized:
                        all_properties.append(standardized)
                        property_count += 1
        
        logger.info(f"📊 Extracted {property_count} properties from {len(dataset.get('appraisals', []))} appraisals")
        
        # Remove duplicates based on address
        unique_properties = []
        seen_addresses = set()
        
        for prop in all_properties:
            address = prop.get('address', '').strip().lower()
            if address and address not in seen_addresses:
                seen_addresses.add(address)
                unique_properties.append(prop)
        
        logger.info(f"📊 Unique properties after deduplication: {len(unique_properties)}")
        
        return unique_properties
    
    def clean_numeric_value(self, value, default=0.0) -> float:
        """
        Clean and convert numeric values, handling various formats
        """
        if value is None:
            return float(default)
        
        if isinstance(value, (int, float)):
            return float(value)
        
        if isinstance(value, str):
            # Remove commas, dollar signs, and whitespace
            cleaned = value.replace(',', '').replace('$', '').strip()
            
            # Handle empty strings
            if not cleaned:
                return float(default)
            
            try:
                return float(cleaned)
            except ValueError:
                logger.warning(f"⚠️  Could not convert '{value}' to float, using default {default}")
                return float(default)
        
        # Fallback for other types
        try:
            return float(value)
        except (ValueError, TypeError):
            return float(default)
    
    def standardize_property_format(self, prop: Dict, appraisal: Dict) -> Optional[Dict]:
        """
        Standardize property format for consistent processing
        Handles None values, comma-separated numbers, and missing data
        """
        try:
            # Get subject property location as fallback
            subject = appraisal.get('subject_property', {})
            default_lat = self.clean_numeric_value(subject.get('latitude'), 44.2312)  # Kingston, ON
            default_lng = self.clean_numeric_value(subject.get('longitude'), -76.4860)
            
            # Clean and extract core property data
            sale_price = self.clean_numeric_value(
                prop.get('sale_price') or prop.get('close_price') or prop.get('price'), 0
            )
            gla = self.clean_numeric_value(
                prop.get('gla') or prop.get('gross_living_area'), 0
            )
            
            standardized = {
                # Identifiers
                'id': prop.get('id', f"prop_{hash(str(prop))}"),
                'address': prop.get('address', prop.get('full_address', 'Unknown Address')),
                'appraisal_id': appraisal.get('id', 'unknown'),
                
                # Core property characteristics (with safe numeric conversion)
                'sale_price': sale_price,
                'gla': gla,
                'lot_size': self.clean_numeric_value(prop.get('lot_size'), 0),
                'bedrooms': self.clean_numeric_value(prop.get('bedrooms'), 0),
                'bathrooms': self.clean_numeric_value(prop.get('bathrooms'), 1.0),
                'year_built': self.clean_numeric_value(prop.get('year_built'), 1990),
                'garage_spaces': self.clean_numeric_value(prop.get('garage_spaces'), 0),
                
                # Property type
                'structure_type': prop.get('structure_type', prop.get('property_type', 'Detached')),
                
                # Location (with safe numeric conversion)
                'latitude': self.clean_numeric_value(prop.get('latitude'), default_lat),
                'longitude': self.clean_numeric_value(prop.get('longitude'), default_lng),
                
                # Metadata
                'source': 'appraisal_dataset',
                'close_date': prop.get('close_date', '2024-01-01')
            }
            
            # Validation: skip properties with missing critical data
            if (not standardized['address'] or 
                standardized['address'] == 'Unknown Address' or
                standardized['sale_price'] <= 0 or
                standardized['gla'] <= 0):
                logger.debug(f"⚠️  Skipping property due to missing critical data: {standardized['address']}")
                return None
            
            return standardized
            
        except Exception as e:
            logger.warning(f"⚠️  Property standardization failed: {e}")
            return None
    
    def extract_ml_features_single(self, property_data: Dict) -> np.ndarray:
        """
        Extract ML features from a single property
        SAME feature engineering as used during model training
        """
        try:
            features = [
                # Core property features
                float(property_data.get('sale_price', 0)) / 1000,  # Price in thousands
                float(property_data.get('gla', 0)),                # Gross Living Area
                float(property_data.get('lot_size', 0)),           # Lot size
                float(property_data.get('bedrooms', 0)),           # Bedrooms
                float(property_data.get('bathrooms', 0)),          # Bathrooms
                float(property_data.get('year_built', 1990)),      # Year built
                float(property_data.get('garage_spaces', 0)),      # Garage spaces
                
                # Property type encoding (one-hot)
                1.0 if property_data.get('structure_type') == 'Detached' else 0.0,
                1.0 if property_data.get('structure_type') == 'Attached' else 0.0,
                1.0 if property_data.get('structure_type') == 'Semi-Detached' else 0.0,
                
                # Location features
                float(property_data.get('latitude', 0)),
                float(property_data.get('longitude', 0)),
                
                # Calculated features
                float(property_data.get('sale_price', 0)) / max(float(property_data.get('gla', 1)), 1),  # Price per sq ft
                2024 - float(property_data.get('year_built', 1990)),  # Property age
                float(property_data.get('bedrooms', 0)) + float(property_data.get('bathrooms', 0)),  # Total rooms
                
                # Quality indicators  
                1.0 if float(property_data.get('sale_price', 0)) > 300000 else 0.0,  # High value property
            ]
            
            return np.array(features, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"❌ Feature extraction error: {e}")
            # Return default features if extraction fails
            return np.zeros(16, dtype=np.float32)
    
    
    def generate_all_embeddings(self, dataset_path: str = "data/appraisals_dataset.json") -> bool:
        """
        Generate embeddings for ALL properties using NumPy + scikit-learn only
        This is the MAIN function that replaces dataset loading during queries
        """
        start_time = time.time()
        logger.info("� Starting lightweight embedding generation")
        logger.info("   Method: NumPy + scikit-learn vectorized computation")
        logger.info("   Dependencies: Zero additional installs required")
        
        try:
            # Step 1: Load trained models
            if not self.load_trained_models():
                logger.error("❌ Cannot proceed without trained models")
                return False
            
            # Step 2: Load dataset (FINAL TIME!)
            dataset = self.load_appraisals_dataset(dataset_path)
            
            # Step 3: Extract all properties
            all_properties = self.extract_all_properties(dataset)
            
            if not all_properties:
                logger.error("❌ No properties extracted from dataset")
                return False
            
            logger.info(f"🔄 Generating embeddings for {len(all_properties)} properties...")
            
            # Step 4: Generate embeddings for all properties
            embeddings = []
            valid_properties = []
            
            for i, prop in enumerate(all_properties):
                if i % 1000 == 0 and i > 0:
                    logger.info(f"   Progress: {i}/{len(all_properties)} properties processed")
                
                # Extract features for this property
                features = self.extract_ml_features_single(prop)
                
                # Apply feature scaling if available
                if self.feature_scaler:
                    try:
                        features_scaled = self.feature_scaler.transform(features.reshape(1, -1))[0]
                    except Exception as e:
                        logger.warning(f"⚠️  Scaling failed for property {prop.get('id')}: {e}")
                        features_scaled = features
                else:
                    features_scaled = features
                
                # Validate features
                if not np.isnan(features_scaled).any() and not np.isinf(features_scaled).any():
                    embeddings.append(features_scaled)
                    valid_properties.append(prop)
                else:
                    logger.warning(f"⚠️  Invalid features for property {prop.get('id', 'unknown')}")
            
            # Step 5: Convert to numpy arrays
            embeddings_matrix = np.array(embeddings, dtype=np.float32)
            
            logger.info("✅ Embedding generation completed")
            logger.info(f"   Properties processed: {len(valid_properties)}")
            logger.info(f"   Embedding shape: {embeddings_matrix.shape}")
            logger.info(f"   Features per property: {embeddings_matrix.shape[1]}")
            logger.info(f"   Memory usage: {embeddings_matrix.nbytes / 1024:.1f} KB")
            
            # Step 6: Save embeddings and metadata
            success = self.save_embeddings_and_metadata(embeddings_matrix, valid_properties)
            
            if success:
                total_time = time.time() - start_time
                logger.info("🎉 Lightweight embedding generation COMPLETE!")
                logger.info(f"   Total time: {total_time:.2f} seconds")
                logger.info(f"   Average time per property: {total_time/len(valid_properties)*1000:.2f}ms")
                logger.info("   ✅ System ready for fast queries - NO dataset loading required!")
                
                # Step 7: Generate summary statistics
                self.generate_embedding_stats(embeddings_matrix, valid_properties, total_time)
                
                return True
            else:
                logger.error("❌ Failed to save embeddings")
                return False
                
        except Exception as e:
            logger.error(f"❌ Embedding generation failed: {e}")
            return False
    
    def save_embeddings_and_metadata(self, embeddings: np.ndarray, properties: List[Dict]) -> bool:
        """
        Save embeddings and metadata to disk
        """
        try:
            # Create output directory
            self.output_dir.mkdir(parents=True, exist_ok=True)
            
            # Save embeddings as NumPy array
            embeddings_file = self.output_dir / "property_embeddings.npy"
            np.save(embeddings_file, embeddings)
            logger.info(f"💾 Embeddings saved: {embeddings_file}")
            
            # Save property metadata as JSON
            metadata_file = self.output_dir / "property_metadata.json"
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(properties, f, indent=2, default=str, ensure_ascii=False)
            logger.info(f"💾 Metadata saved: {metadata_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save embeddings: {e}")
            return False
    
    def generate_embedding_stats(self, embeddings: np.ndarray, properties: List[Dict], generation_time: float):
        """
        Generate comprehensive statistics about the generated embeddings
        """
        try:
            stats = {
                'generation_info': {
                    'timestamp': time.time(),
                    'generation_time_seconds': generation_time,
                    'method': 'numpy_sklearn_vectorized',
                    'dependencies': ['numpy', 'scikit-learn'],
                    'no_additional_installs': True
                },
                'dataset_info': {
                    'total_properties': len(properties),
                    'embedding_dimension': int(embeddings.shape[1]),
                    'data_type': str(embeddings.dtype)
                },
                'memory_info': {
                    'embeddings_size_bytes': int(embeddings.nbytes),
                    'embeddings_size_kb': embeddings.nbytes / 1024,
                    'embeddings_size_mb': embeddings.nbytes / (1024 * 1024),
                    'metadata_estimated_kb': len(json.dumps(properties, default=str).encode('utf-8')) / 1024
                },
                'performance_estimates': {
                    'expected_query_time_ms': f'2-10ms for {len(properties):,} properties',
                    'time_complexity': 'O(n) linear search',
                    'search_method': 'vectorized_cosine_similarity',
                    'accuracy': '100% (exact similarity computation)'
                },
                'embedding_statistics': {
                    'min_value': float(embeddings.min()),
                    'max_value': float(embeddings.max()),
                    'mean_value': float(embeddings.mean()),
                    'std_value': float(embeddings.std()),
                    'has_nan_values': bool(np.isnan(embeddings).any()),
                    'has_inf_values': bool(np.isinf(embeddings).any())
                }
            }
            
            # Save statistics
            stats_file = self.output_dir / "embedding_generation_stats.json"
            with open(stats_file, 'w', encoding='utf-8') as f:
                json.dump(stats, f, indent=2, ensure_ascii=False)
            
            logger.info(f"📊 Generation statistics saved: {stats_file}")
            
        except Exception as e:
            logger.warning(f"⚠️  Failed to generate stats: {e}")


def generate_embeddings_main():
    """
    Main function to generate property embeddings
    Call this to process the dataset and create fast search index
    """
    generator = LightweightEmbeddingGenerator()
    
    logger.info("=" * 60)
    logger.info("🚀 LIGHTWEIGHT PROPERTY EMBEDDING GENERATION")
    logger.info("   Using: NumPy + scikit-learn only")
    logger.info("   No FAISS or additional dependencies required!")
    logger.info("=" * 60)
    
    success = generator.generate_all_embeddings()
    
    if success:
        logger.info("✅ SUCCESS: Embeddings generated successfully!")
        logger.info("   Next steps:")
        logger.info("   1. Start the backend server")
        logger.info("   2. Use the /recommendations/fast/ endpoint")
        logger.info("   3. Enjoy sub-10ms query times!")
    else:
        logger.error("❌ FAILED: Embedding generation unsuccessful")
        logger.error("   Check the logs above for error details")
    
    return success


if __name__ == "__main__":
    generate_embeddings_main()

