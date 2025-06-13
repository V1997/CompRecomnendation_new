"use client";

import { useState } from 'react';
import { SubjectProperty, OptimizedAppraisalResponse } from '@/types';
import { propertyAPI } from '@/lib/api';

// Enhanced PropertySearch Component
function PropertySearch({ onSearch }: { onSearch: (property: SubjectProperty) => void }) {
  const [formData, setFormData] = useState<Partial<SubjectProperty>>({
    address: '789 Calgary Trail, Calgary, AB',
    propertyType: 'Single Family',
    structureType: 'Detached',
    gla: 2400,
    lotSize: 6000,
    bedrooms: 4,
    bathrooms: 3.0,
    yearBuilt: 2010,
    condition: 'Good',
    quality: 'Average',
    appraisalDate: new Date().toISOString().split('T')[0],
    estimatedValue: 550000,
    latitude: 51.0447,
    longitude: -114.0719
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof SubjectProperty, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Create subject property for API
    const subjectProperty: SubjectProperty = {
      id: 'subject-001',
      address: formData.address || '',
      propertyType: formData.propertyType || 'Single Family',
      structureType: formData.structureType || 'Detached',
      gla: formData.gla || 0,
      lotSize: formData.lotSize || 0,
      bedrooms: formData.bedrooms || 0,
      bathrooms: formData.bathrooms || 0,
      yearBuilt: formData.yearBuilt || 2000,
      condition: formData.condition || 'Average',
      quality: formData.quality || 'Average',
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      neighborhood: 'Calgary',
      features: [],
      appraisalDate: formData.appraisalDate || new Date().toISOString().split('T')[0],
      estimatedValue: formData.estimatedValue
    };

    onSearch(subjectProperty);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          🏠
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subject Property Details</h2>
          <p className="text-gray-600">Enter the property details to find comparable properties</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Address
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="789 Calgary Trail, Calgary, AB"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Property Type and Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={formData.propertyType || ''}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Single Family">Single Family</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Condominium">Condominium</option>
              <option value="Multi-Family">Multi-Family</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Structure Type
            </label>
            <select
              value={formData.structureType || ''}
              onChange={(e) => handleInputChange('structureType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Detached">Detached</option>
              <option value="Attached">Attached</option>
              <option value="Semi-Detached">Semi-Detached</option>
            </select>
          </div>
        </div>

        {/* Size and Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GLA (sq ft)
            </label>
            <input
              type="number"
              value={formData.gla || ''}
              onChange={(e) => handleInputChange('gla', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lot Size (sq ft)
            </label>
            <input
              type="number"
              value={formData.lotSize || ''}
              onChange={(e) => handleInputChange('lotSize', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <input
              type="number"
              value={formData.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Year Built and Condition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built
            </label>
            <input
              type="number"
              value={formData.yearBuilt || ''}
              onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              value={formData.condition || ''}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality
            </label>
            <select
              value={formData.quality || ''}
              onChange={(e) => handleInputChange('quality', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Superior">Superior</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔍
            {isLoading ? 'Analyzing...' : 'Find Comparable Properties'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Home() {
  const [subjectProperty, setSubjectProperty] = useState<SubjectProperty | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizedAppraisalResponse['recommendations']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  const handlePropertySearch = async (property: SubjectProperty) => {
    console.log('🏠 Property search initiated:', property);
    setSubjectProperty(property);
    setIsLoading(true);
    setError(null);
    setPerformanceMetrics(null);

    try {
      // Transform frontend data to match the exact API schema
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

      console.log('🚀 Calling Optimized API with:', apiSubjectProperty);
      
      const startTime = performance.now();
      const response = await propertyAPI.getOptimizedRecommendations(apiSubjectProperty);
      const endTime = performance.now();
      
      console.log('✅ API Response received:', response);

      if (response && response.recommendations) {
        setRecommendations(response.recommendations);
        setPerformanceMetrics({
          frontend_time: endTime - startTime,
          ...response.metadata
        });
        console.log(`🎯 Found ${response.recommendations.length} recommendations in ${(endTime - startTime).toFixed(2)}ms`);
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
          
          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                ⚡ Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.engine_processing_time_ms?.toFixed(2) || 'N/A'}ms
                  </div>
                  <div className="text-sm text-green-700">Core Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.total_api_response_time_ms?.toFixed(2) || 'N/A'}ms
                  </div>
                  <div className="text-sm text-green-700">Total API Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceMetrics.dataset_size?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-sm text-green-700">Dataset Size</div>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🏘️ Comparable Properties</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
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
