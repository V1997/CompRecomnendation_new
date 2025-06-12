"use client";

import { useState } from 'react';
import { Header } from "../components/Header";
import { PropertySearch } from "../components/PropertySearch";
import { Dashboard } from "../components/Dashboard";
import { CompRecommendation, SubjectProperty, AppraisalResponse } from '@/types';
import { propertyAPI } from '@/lib/api';
import { calculateDistance, calculateDaysSince } from '@/lib/utils';

export default function RecommendationsPage() {
  const [subjectProperty, setSubjectProperty] = useState<SubjectProperty | null>(null);
  const [recommendations, setRecommendations] = useState<CompRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [useOptimizedEngine, setUseOptimizedEngine] = useState(true);

  const handlePropertySearch = async (property: SubjectProperty) => {
    console.log('handlePropertySearch called with:', property);
    setSubjectProperty(property);
    setIsLoading(true);
    setError(null);
    setPerformanceMetrics(null);

    try {
      // Transform frontend data to backend API format
      const apiSubjectProperty = {
        id: property.id,
        address: property.address,
        property_type: property.propertyType,
        structure_type: property.structureType,
        gla: property.gla,
        lot_size: property.lotSize,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        year_built: property.yearBuilt,
        condition: property.condition,
        quality: property.quality,
        latitude: property.latitude,
        longitude: property.longitude,
        neighborhood: property.neighborhood,
        features: property.features || [],
        appraisal_date: new Date(property.appraisalDate).toISOString(),
        estimated_value: property.estimatedValue,
      };

      console.log(`Calling ${useOptimizedEngine ? 'Optimized' : 'Smart'} API with subject property:`, apiSubjectProperty);
      
      const startTime = performance.now();
      let response: AppraisalResponse;
      
      if (useOptimizedEngine) {
        response = await propertyAPI.getOptimizedRecommendations(apiSubjectProperty);
      } else {
        response = await propertyAPI.getSmartRecommendations(apiSubjectProperty);
      }
      
      const endTime = performance.now();
      const clientTime = endTime - startTime;
      
      console.log(`${useOptimizedEngine ? 'Optimized' : 'Smart'} API response received:`, response);
      
      // Store performance metrics
      setPerformanceMetrics({
        ...response.performance_metrics,
        client_time: clientTime,
        engine_type: useOptimizedEngine ? 'optimized_numpy_sklearn' : 'smart_legacy'
      });
      
      // Transform backend response to frontend format
      const transformedRecommendations: CompRecommendation[] = response.recommendations.map(rec => {
        // Calculate distance and days since sale on frontend (backend provides them too)
        const distance = rec.property.distance_from_subject || calculateDistance(
          property.latitude,
          property.longitude,
          rec.property.latitude,
          rec.property.longitude
        );
        const daysSinceSale = rec.property.days_since_sale || (rec.property.sale_date ? calculateDaysSince(rec.property.sale_date) : 999);

        return {
          property: {
            id: rec.property.id,
            address: rec.property.address,
            saleDate: rec.property.sale_date,
            salePrice: rec.property.sale_price,
            propertyType: rec.property.property_type,
            structureType: rec.property.structure_type,
            gla: rec.property.gla,
            lotSize: rec.property.lot_size,
            bedrooms: rec.property.bedrooms,
            bathrooms: rec.property.bathrooms,
            yearBuilt: rec.property.year_built,
            condition: rec.property.condition,
            quality: rec.property.quality,
            latitude: rec.property.latitude,
            longitude: rec.property.longitude,
            neighborhood: rec.property.neighborhood,
            features: rec.property.features,
            similarityScore: rec.overall_score,
            distanceFromSubject: distance,
            daysSinceSale: daysSinceSale,
            adjustments: {
              glaAdjustment: (rec.property.gla - property.gla) * 50,
              lotSizeAdjustment: (rec.property.lot_size - property.lotSize) * 5,
              conditionAdjustment: rec.property.condition === property.condition ? 0 : 5000,
              locationAdjustment: distance > 1 ? -2000 : 0,
              timeAdjustment: daysSinceSale > 90 ? -3000 : 0,
            },
          },
          rank: rec.rank,
          overallScore: rec.overall_score,
          explanations: rec.explanations,
          reasoning: rec.reasoning,
        };
      });

      console.log('Setting recommendations:', transformedRecommendations);
      setRecommendations(transformedRecommendations);

    } catch (err) {
      console.error(`${useOptimizedEngine ? 'Optimized' : 'Smart'} API call failed:`, err);
      setError('Unable to find comparable properties from our dataset. Please try adjusting your search criteria or try again later.');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Engine Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🚀 Recommendation Engine</h2>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="engine"
                  checked={useOptimizedEngine}
                  onChange={() => setUseOptimizedEngine(true)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">
                  ⚡ Optimized Engine (NumPy + scikit-learn)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="engine"
                  checked={!useOptimizedEngine}
                  onChange={() => setUseOptimizedEngine(false)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">
                  🔄 Legacy Smart Engine
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {useOptimizedEngine 
                ? "Uses pre-computed embeddings for instant similarity search (~25ms)" 
                : "Traditional approach with full dataset processing (~200ms+)"
              }
            </p>
          </div>

          <PropertySearch onSearch={handlePropertySearch} />
          
          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                📊 Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.processing_time?.toFixed(2) || 'N/A'}ms
                  </div>
                  <div className="text-sm text-green-700">Core Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.client_time?.toFixed(2) || 'N/A'}ms
                  </div>
                  <div className="text-sm text-green-700">Total API Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.total_candidates?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-sm text-green-700">Properties Evaluated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.confidence?.toFixed(1) || 'N/A'}%
                  </div>
                  <div className="text-sm text-green-700">Confidence</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-green-700">
                <div><strong>Engine:</strong> {performanceMetrics.engine_type}</div>
                <div><strong>Search Method:</strong> {performanceMetrics.search_method || 'N/A'}</div>
                <div><strong>Dataset Loading:</strong> {performanceMetrics.dataset_loading ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg font-medium text-gray-700">
                  {useOptimizedEngine 
                    ? "🚀 Searching 7,388+ properties with optimized engine..." 
                    : "🔄 Searching database with legacy engine..."
                  }
                </span>
              </div>
            </div>
          )}

          {subjectProperty && recommendations.length > 0 && !isLoading && (
            <Dashboard 
              subjectProperty={subjectProperty}
              recommendations={recommendations}
            />
          )}

          {subjectProperty && recommendations.length === 0 && !isLoading && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No Comparable Properties Found</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>We searched our database of 7,388+ properties but couldn't find suitable comparable properties for your search criteria. Try expanding your search area or adjusting the property details.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
