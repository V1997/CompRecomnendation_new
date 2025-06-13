// Types for the property valuation system
export interface Property {
  id: string;
  address: string;
  saleDate?: string;
  salePrice?: number;
  propertyType: string;
  structureType: string;
  gla: number; // Gross Living Area
  lotSize: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  condition: string;
  quality: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
  features?: string[];
}

export interface SubjectProperty extends Property {
  appraisalDate: string;
  estimatedValue?: number;
}

export interface CompProperty extends Property {
  similarityScore: number;
  distanceFromSubject: number;
  daysSinceSale?: number;
  adjustments?: {
    glaAdjustment: number;
    lotSizeAdjustment: number;
    conditionAdjustment: number;
    locationAdjustment: number;
    timeAdjustment: number;
  };
}

export interface Explanation {
  factor: string;
  description: string;
  weight: number;
  contribution: number;
}

export interface CompRecommendation {
  property: CompProperty;
  rank: number;
  overallScore: number;
  explanations: Explanation[];
  reasoning: string;
}

export interface AppraisalRequest {
  subject_property: {
    id: string;
    address: string;
    property_type: string;
    structure_type: string;
    gla: number;
    lot_size: number;
    bedrooms: number;
    bathrooms: number;
    year_built: number;
    condition: string;
    quality: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    features?: string[];
    appraisal_date: string;
    estimated_value?: number;
  };
  candidate_properties: {
    id: string;
    address: string;
    property_type: string;
    structure_type: string;
    gla: number;
    lot_size: number;
    bedrooms: number;
    bathrooms: number;
    year_built: number;
    condition: string;
    quality: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    features?: string[];
    sale_date: string;
    sale_price: number;
  }[];
  max_distance?: number;
  max_days_since_sale?: number;
}

export interface AppraisalResponse {
  subject_property: {
    id: string;
    address: string;
    property_type: string;
    structure_type: string;
    gla: number;
    lot_size: number;
    bedrooms: number;
    bathrooms: number;
    year_built: number;
    condition: string;
    quality: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    features?: string[];
    appraisal_date: string;
    estimated_value?: number;
  };
  recommendations: {
    property: {
      id: string;
      address: string;
      property_type: string;
      structure_type: string;
      gla: number;
      lot_size: number;
      bedrooms: number;
      bathrooms: number;
      year_built: number;
      condition: string;
      quality: string;
      latitude: number;
      longitude: number;
      neighborhood?: string;
      features?: string[];
      sale_date: string;
      sale_price: number;
      similarity_score: number;
      distance_from_subject: number;
      days_since_sale: number;
      adjustments?: {
        gla_adjustment: number;
        lot_size_adjustment: number;
        condition_adjustment: number;
        location_adjustment: number;
        time_adjustment: number;
      };
    };
    rank: number;
    overall_score: number;
    explanations: Explanation[];
    reasoning: string;
  }[];
  performance_metrics: {
    total_candidates: number;
    processing_time: number;
    confidence: number;
    model_version: string;
  };
  explanations: {
    methodology: string;
    key_factors: string[];
    limitations: string[];
  };
}

export interface UserFeedback {
  recommendation_id: string;
  user_rating: number;
  comments: string;
  helpful: boolean;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  validationResults: {
    totalAppraisals: number;
    correctPredictions: number;
    averageScore: number;
  };
}

export interface OptimizedAppraisalResponse {
  subject_property: {
    id: string;
    address: string;
    property_type: string;
    structure_type: string;
    gla: number;
    lot_size: number;
    bedrooms: number;
    bathrooms: number;
    year_built: number;
    condition: string;
    quality: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    features?: string[];
    appraisal_date: string;
    estimated_value?: number;
  };
  recommendations: {
    property: {
      id: string;
      address: string;
      property_type: string;
      structure_type?: string;
      gla: number;
      lot_size: number;
      bedrooms: number;
      bathrooms: number;
      year_built: number;
      condition: string;
      quality: string;
      latitude: number;
      longitude: number;
      neighborhood?: string;
      features?: string[];
      sale_date: string;
      sale_price: number;
    };
    similarity_score: number;
    rank: number;
    explanation?: string;
    search_method?: string;
  }[];
  metadata: {
    total_api_response_time_ms: number;
    engine_processing_time_ms: number;
    dataset_size: number;
    search_method: string;
    engine_type: string;
  };
}
