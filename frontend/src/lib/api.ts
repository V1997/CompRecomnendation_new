import axios from 'axios';
import { AppraisalRequest, AppraisalResponse, UserFeedback, ModelPerformance } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging and performance monitoring
apiClient.interceptors.request.use(
  (config) => {
    (config as any).metadata = { startTime: new Date() };
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime.getTime() - (response.config as any).metadata.startTime.getTime();
    console.log(`✅ API Response: ${response.status} in ${duration}ms - ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = (error.config as any)?.metadata ? endTime.getTime() - (error.config as any).metadata.startTime.getTime() : 0;
    console.error(`❌ API Error: ${error.response?.status || 'Network'} in ${duration}ms - ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export const propertyAPI = {
  // Get property recommendations (standard)
  getRecommendations: async (request: AppraisalRequest): Promise<AppraisalResponse> => {
    const response = await apiClient.post('/api/recommendations/', request);
    return response.data;
  },

  // Get enhanced ML recommendations
  getEnhancedRecommendations: async (request: AppraisalRequest): Promise<AppraisalResponse> => {
    try {
      const response = await apiClient.post('/api/dataset/recommendations/enhanced/', request);
      return response.data;
    } catch (error) {
      // Fallback to standard recommendations if enhanced fails
      console.warn('Enhanced ML recommendations failed, falling back to standard:', error);
      return await apiClient.post('/api/recommendations/', request).then(res => res.data);
    }
  },

  // Get smart recommendations (finds candidates automatically from dataset)
  getSmartRecommendations: async (subjectProperty: any): Promise<AppraisalResponse> => {
    try {
      const request = {
        subject_property: subjectProperty,
        max_distance: 50.0,  // 50 mile radius
        max_days_since_sale: 730  // 2 years
      };
      const response = await apiClient.post('/api/dataset/recommendations/smart/', request);
      return response.data;
    } catch (error) {
      console.warn('Smart recommendations failed:', error);
      throw error; // Don't fallback to mock data anymore
    }
  },

  // Get optimized ML recommendations (fastest, production-ready)
  getOptimizedRecommendations: async (subjectProperty: any): Promise<AppraisalResponse> => {
    try {
      const request = {
        subject_property: subjectProperty,
        max_distance: 50.0,  // 50 mile radius  
        max_days_since_sale: 730  // 2 years
      };
      const response = await apiClient.post('/api/dataset/recommendations/optimized/', request);
      return response.data;
    } catch (error) {
      console.warn('Optimized recommendations failed, falling back to smart recommendations:', error);
      // Fallback to smart recommendations if optimized fails
      return await apiClient.post('/api/dataset/recommendations/smart/', {
        subject_property: subjectProperty,
        max_distance: 50.0,
        max_days_since_sale: 730
      }).then(res => res.data);
    }
  },

  // Submit user feedback
  submitFeedback: async (feedback: UserFeedback): Promise<void> => {
    await apiClient.post('/api/feedback/', feedback);
  },

  // Get model performance metrics
  getPerformanceMetrics: async (startDate?: string, endDate?: string): Promise<ModelPerformance> => {
    const body = startDate && endDate ? { start_date: startDate, end_date: endDate } : {};
    const response = await apiClient.post('/api/performance/', body);
    return response.data;
  },

  // Upload appraisal data for training
  uploadAppraisalData: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await apiClient.post('/api/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Retrain model with new data
  retrainModel: async (): Promise<void> => {
    await apiClient.post('/api/retrain');
  },

  // Get explanation for a specific recommendation
  getExplanation: async (subjectId: string, compId: string): Promise<any> => {
    const response = await apiClient.get(`/api/explanation/${subjectId}/${compId}`);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};

// Mock data for development/testing
export const mockData = {
  sampleSubjectProperty: {
    id: 'subject-001',
    address: '123 Main St, Springfield, IL',
    appraisalDate: '2024-12-01',
    propertyType: 'Single Family',
    structureType: 'Detached',
    gla: 2500,
    lotSize: 8000,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2010,
    condition: 'Good',
    quality: 'Average',
    latitude: 39.7817,
    longitude: -89.6501,
    neighborhood: 'Downtown Springfield',
    estimatedValue: 350000,
  },

  sampleCandidateProperties: [
    // Springfield, IL properties
    {
      id: 'comp-001',
      address: '456 Oak Ave, Springfield, IL',
      saleDate: '2024-11-15',
      salePrice: 345000,
      propertyType: 'Single Family',
      structureType: 'Detached',
      gla: 2450,
      lotSize: 7800,
      bedrooms: 4,
      bathrooms: 3,
      yearBuilt: 2008,
      condition: 'Good',
      quality: 'Average',
      latitude: 39.7820,
      longitude: -89.6505,
      neighborhood: 'Downtown Springfield',
      features: ['garage', 'basement'],
    },
    {
      id: 'comp-002',
      address: '789 Pine St, Springfield, IL',
      saleDate: '2024-10-20',
      salePrice: 365000,
      propertyType: 'Single Family',
      structureType: 'Detached',
      gla: 2600,
      lotSize: 8200,
      bedrooms: 4,
      bathrooms: 3,
      yearBuilt: 2012,
      condition: 'Excellent',
      quality: 'Good',
      latitude: 39.7815,
      longitude: -89.6498,
      neighborhood: 'Downtown Springfield',
    },
    {
      id: 'comp-003',
      address: '321 Elm Dr, Springfield, IL',
      saleDate: '2024-09-10',
      salePrice: 330000,
      propertyType: 'Single Family',
      structureType: 'Detached',
      gla: 2300,
      lotSize: 7500,
      bedrooms: 3,
      bathrooms: 2.5,
      yearBuilt: 2005,
      condition: 'Fair',
      quality: 'Average',
      latitude: 39.7812,
      longitude: -89.6510,
      neighborhood: 'Downtown Springfield',
    },
    // Manhattan, NY properties
    {
      id: 'comp-004',
      address: '234 Park Ave, Manhattan, NY',
      saleDate: '2024-11-20',
      salePrice: 850000,
      propertyType: 'Condominium',
      structureType: 'Attached',
      gla: 1200,
      lotSize: 0,
      bedrooms: 2,
      bathrooms: 2,
      yearBuilt: 2015,
      condition: 'Excellent',
      quality: 'Superior',
      latitude: 40.7590,
      longitude: -73.9845,
      neighborhood: 'Midtown Manhattan',
    },
    {
      id: 'comp-005',
      address: '567 5th Ave, Manhattan, NY',
      saleDate: '2024-10-25',
      salePrice: 1200000,
      propertyType: 'Condominium',
      structureType: 'Attached',
      gla: 1500,
      lotSize: 0,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2018,
      condition: 'Excellent',
      quality: 'Superior',
      latitude: 40.7580,
      longitude: -73.9855,
      neighborhood: 'Midtown Manhattan',
    },
    {
      id: 'comp-006',
      address: '890 Broadway, Manhattan, NY',
      saleDate: '2024-09-15',
      salePrice: 750000,
      propertyType: 'Condominium',
      structureType: 'Attached',
      gla: 1000,
      lotSize: 0,
      bedrooms: 1,
      bathrooms: 1,
      yearBuilt: 2010,
      condition: 'Good',
      quality: 'Good',
      latitude: 40.7600,
      longitude: -73.9840,
      neighborhood: 'Midtown Manhattan',
    },
    // Brooklyn, NY properties
    {
      id: 'comp-007',
      address: '123 Brooklyn Heights Blvd, Brooklyn, NY',
      saleDate: '2024-11-10',
      salePrice: 650000,
      propertyType: 'Townhouse',
      structureType: 'Attached',
      gla: 1800,
      lotSize: 2000,
      bedrooms: 3,
      bathrooms: 2.5,
      yearBuilt: 2005,
      condition: 'Good',
      quality: 'Good',
      latitude: 40.6780,
      longitude: -73.9440,
      neighborhood: 'Brooklyn Heights',
    },
    {
      id: 'comp-008',
      address: '456 Park Slope Ave, Brooklyn, NY',
      saleDate: '2024-10-30',
      salePrice: 720000,
      propertyType: 'Townhouse',
      structureType: 'Attached',
      gla: 2000,
      lotSize: 2200,
      bedrooms: 4,
      bathrooms: 3,
      yearBuilt: 2008,
      condition: 'Excellent',
      quality: 'Good',
      latitude: 40.6785,
      longitude: -73.9445,
      neighborhood: 'Park Slope',
    },
    {
      id: 'comp-009',
      address: '789 Williamsburg St, Brooklyn, NY',
      saleDate: '2024-09-20',
      salePrice: 580000,
      propertyType: 'Condominium',
      structureType: 'Attached',
      gla: 1400,
      lotSize: 0,
      bedrooms: 2,
      bathrooms: 2,
      yearBuilt: 2012,
      condition: 'Good',
      quality: 'Average',
      latitude: 40.6790,
      longitude: -73.9450,
      neighborhood: 'Williamsburg',
    },
    // Queens, NY properties
    {
      id: 'comp-010',
      address: '321 Queens Blvd, Queens, NY',
      saleDate: '2024-11-05',
      salePrice: 520000,
      propertyType: 'Single Family',
      structureType: 'Detached',
      gla: 1600,
      lotSize: 3000,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2000,
      condition: 'Good',
      quality: 'Average',
      latitude: 40.7280,
      longitude: -73.7945,
      neighborhood: 'Elmhurst',
    },
    {
      id: 'comp-011',
      address: '654 Astoria Ave, Queens, NY',
      saleDate: '2024-10-15',
      salePrice: 480000,
      propertyType: 'Single Family',
      structureType: 'Detached',
      gla: 1500,
      lotSize: 2800,
      bedrooms: 3,
      bathrooms: 1.5,
      yearBuilt: 1995,
      condition: 'Fair',
      quality: 'Average',
      latitude: 40.7285,
      longitude: -73.7950,
      neighborhood: 'Astoria',
    },
  ],
};
