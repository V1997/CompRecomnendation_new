"use client";

import { useState } from 'react';
import { PropertySearch } from "./components/PropertySearch";
import { SubjectProperty, OptimizedAppraisalResponse } from '@/types';
import { propertyAPI } from '@/lib/api';

export default function Home() {
  const [subjectProperty, setSubjectProperty] = useState<SubjectProperty | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizedAppraisalResponse['recommendations']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePropertySearch = async (property: SubjectProperty) => {
    console.log('🔍 Property search initiated:', property);
    setSubjectProperty(property);
    setIsLoading(true);
    setError(null);

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
      const response = await propertyAPI.getOptimizedRecommendations(apiSubjectProperty);
      
      console.log('✅ API Response received:', response);
      
      if (response && response.recommendations) {
        setRecommendations(response.recommendations);
        console.log(`Found ${response.recommendations.length} recommendations`);
      } else {
        setError('No recommendations found');
      }
    } catch (err) {
      console.error('❌ Error calling API:', err);
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
          <PropertySearch onSearch={handlePropertySearch} />
          
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Recommendations</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{rec.property.address}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>💰 ${rec.property.sale_price?.toLocaleString()}</p>
                      <p>🏠 {rec.property.gla?.toLocaleString()} sq ft</p>
                      <p>🛏️ {rec.property.bedrooms}bd / 🛁 {rec.property.bathrooms}ba</p>
                      <p>📅 Built {rec.property.year_built}</p>
                      <p>📊 {(rec.similarity_score * 100).toFixed(1)}% match</p>
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
