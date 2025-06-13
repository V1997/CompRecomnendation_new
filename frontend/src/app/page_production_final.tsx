"use client";

import { useState } from 'react';
import { PropertySearchBasicForm } from "./components/PropertySearchBasicForm";
import { SubjectProperty, OptimizedAppraisalResponse } from '@/types';
import { propertyAPI } from '@/lib/api';

export default function Home() {
  const [subjectProperty, setSubjectProperty] = useState<SubjectProperty | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizedAppraisalResponse['recommendations']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  const handlePropertySearch = async (property: SubjectProperty) => {
    console.log('🔍 Property search initiated:', property);
    setSubjectProperty(property);
    setIsLoading(true);
    setError(null);
    setPerformanceMetrics(null);

    try {
      // Transform to API format
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
        neighborhood: property.neighborhood || null,
        features: property.features || [],
        appraisal_date: new Date(property.appraisalDate).toISOString(),
        estimated_value: property.estimatedValue || null,
      };

      console.log('🚀 Calling Optimized API...');
      const startTime = performance.now();
      const response = await propertyAPI.getOptimizedRecommendations(apiSubjectProperty);
      const endTime = performance.now();
      
      console.log('✅ API Response received:', response);
      
      if (response && response.recommendations) {
        setRecommendations(response.recommendations);
        setPerformanceMetrics({
          processing_time: endTime - startTime,
          engine_processing_time: response.metadata?.engine_processing_time_ms,
          total_candidates: response.metadata?.dataset_size,
          engine_type: response.metadata?.engine_type,
        });
        console.log(`📊 Found ${response.recommendations.length} recommendations`);
      } else {
        setError('No recommendations found');
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                🏢
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PropertyComps AI</h1>
                <p className="text-sm text-gray-600">Intelligent Property Valuation System</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                🔧
                <span>ML-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                📊
                <span>Real-time Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <PropertySearchBasicForm onSearch={handlePropertySearch} />
          
          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                ⚡ Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.processing_time?.toFixed(2) || 'N/A'}ms
                  </div>
                  <div className="text-sm text-green-700">Total Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.engine_processing_time?.toFixed(2) || 'N/A'}ms
                  </div>
                  <div className="text-sm text-green-700">Engine Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.total_candidates?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-sm text-green-700">Properties Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.engine_type || 'Optimized'}
                  </div>
                  <div className="text-sm text-green-700">Engine Type</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    🔍 Analyzing Property...
                  </h3>
                  <p className="text-blue-700">Finding the best comparable properties using AI</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {subjectProperty && recommendations.length > 0 && !isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🏠 Comparable Properties Found
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">{rec.property.address}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Rank #{rec.rank}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>💰 Sale Price:</span>
                        <span className="font-medium">${rec.property.sale_price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🏠 Living Area:</span>
                        <span>{rec.property.gla?.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🛏️ Bed/Bath:</span>
                        <span>{rec.property.bedrooms}bd / {rec.property.bathrooms}ba</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📅 Year Built:</span>
                        <span>{rec.property.year_built}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                        <span>📊 Similarity:</span>
                        <span className="font-bold text-green-600">
                          {(rec.similarity_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {subjectProperty && recommendations.length === 0 && !isLoading && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-800">No Results Found</h3>
                  <p className="text-yellow-700">
                    No comparable properties found for the specified criteria. Try adjusting your search parameters.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
