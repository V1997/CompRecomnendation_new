"use client";

import { useState } from 'react';
import { propertyAPI } from '@/lib/api';

interface PerformanceResult {
  engine: string;
  responseTime: number;
  processingTime: number;
  totalCandidates: number;
  confidence: number;
  searchMethod: string;
  datasetLoading: boolean;
  success: boolean;
  error?: string;
}

export default function PerformanceComparison() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PerformanceResult[]>([]);

  const testSubjectProperty = {
    id: 'perf-test-001',
    address: '123 Performance Test St, Toronto, ON',
    property_type: 'Single Family',
    structure_type: 'Detached',
    gla: 2000,
    lot_size: 6000,
    bedrooms: 3,
    bathrooms: 2.0,
    year_built: 2010,
    condition: 'Good',
    quality: 'Average',
    latitude: 43.6532,
    longitude: -79.3832,
    neighborhood: 'Downtown Toronto',
    features: [],
    appraisal_date: new Date().toISOString(),
    estimated_value: 450000,
  };

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setResults([]);

    const testResults: PerformanceResult[] = [];

    // Test Optimized Engine
    try {
      const startTime = performance.now();
      const optimizedResponse = await propertyAPI.getOptimizedRecommendations(testSubjectProperty);
      const endTime = performance.now();

      testResults.push({
        engine: 'Optimized (NumPy + scikit-learn)',
        responseTime: endTime - startTime,
        processingTime: optimizedResponse.performance_metrics?.processing_time || 0,
        totalCandidates: optimizedResponse.performance_metrics?.total_candidates || 0,
        confidence: optimizedResponse.performance_metrics?.confidence || 0,
        searchMethod: (optimizedResponse.performance_metrics as any)?.search_method || 'N/A',
        datasetLoading: (optimizedResponse.performance_metrics as any)?.dataset_loading || false,
        success: true,
      });
    } catch (error) {
      testResults.push({
        engine: 'Optimized (NumPy + scikit-learn)',
        responseTime: 0,
        processingTime: 0,
        totalCandidates: 0,
        confidence: 0,
        searchMethod: 'N/A',
        datasetLoading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test Smart Engine (Legacy)
    try {
      const startTime = performance.now();
      const smartResponse = await propertyAPI.getSmartRecommendations(testSubjectProperty);
      const endTime = performance.now();

      testResults.push({
        engine: 'Smart (Legacy)',
        responseTime: endTime - startTime,
        processingTime: smartResponse.performance_metrics?.processing_time || 0,
        totalCandidates: smartResponse.performance_metrics?.total_candidates || 0,
        confidence: smartResponse.performance_metrics?.confidence || 0,
        searchMethod: (smartResponse.performance_metrics as any)?.search_method || 'N/A',
        datasetLoading: (smartResponse.performance_metrics as any)?.dataset_loading || true,
        success: true,
      });
    } catch (error) {
      testResults.push({
        engine: 'Smart (Legacy)',
        responseTime: 0,
        processingTime: 0,
        totalCandidates: 0,
        confidence: 0,
        searchMethod: 'N/A',
        datasetLoading: true,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getPerformanceImprovement = () => {
    if (results.length < 2 || !results[0].success || !results[1].success) return null;
    
    const optimized = results[0];
    const legacy = results[1];
    
    const responseTimeImprovement = ((legacy.responseTime - optimized.responseTime) / legacy.responseTime) * 100;
    const processingTimeImprovement = ((legacy.processingTime - optimized.processingTime) / legacy.processingTime) * 100;
    
    return {
      responseTimeImprovement,
      processingTimeImprovement,
      speedupFactor: legacy.responseTime / optimized.responseTime,
    };
  };

  const improvement = getPerformanceImprovement();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Performance Comparison</h1>
        <p className="text-gray-600">Compare the optimized NumPy + scikit-learn engine vs legacy approach</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Performance Test</h2>
          <button
            onClick={runPerformanceTest}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isRunning ? '🔄 Running Tests...' : '🚀 Run Performance Test'}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-2">Test Subject Property:</h3>
          <p className="text-sm text-gray-600">
            {testSubjectProperty.address} • {testSubjectProperty.gla.toLocaleString()} sq ft • 
            {testSubjectProperty.bedrooms} bed, {testSubjectProperty.bathrooms} bath • 
            Built {testSubjectProperty.year_built} • ${testSubjectProperty.estimated_value?.toLocaleString()}
          </p>
        </div>

        {isRunning && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg font-medium text-gray-700">Testing both engines...</span>
          </div>
        )}

        {results.length > 0 && !isRunning && (
          <div className="space-y-4">
            {improvement && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">🎉 Performance Improvement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {improvement.responseTimeImprovement.toFixed(1)}%
                    </div>
                    <div className="text-green-700">Faster Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {improvement.speedupFactor.toFixed(1)}x
                    </div>
                    <div className="text-green-700">Speed Multiplier</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {improvement.processingTimeImprovement.toFixed(1)}%
                    </div>
                    <div className="text-green-700">Processing Improvement</div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Engine</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Response Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Processing Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Properties</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Confidence</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Dataset Loading</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {result.engine}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.success ? (
                          <span className="text-green-600 font-semibold">✅ Success</span>
                        ) : (
                          <span className="text-red-600 font-semibold">❌ Failed</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-mono">
                        {result.success ? `${result.responseTime.toFixed(2)}ms` : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-mono">
                        {result.success ? `${result.processingTime.toFixed(2)}ms` : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.success ? result.totalCandidates.toLocaleString() : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.success ? `${result.confidence.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {result.success ? (result.datasetLoading ? '❌ Yes' : '✅ No') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.some(r => !r.success) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">⚠️ Errors</h3>
                {results.filter(r => !r.success).map((result, index) => (
                  <div key={index} className="text-sm text-red-700 mb-1">
                    <strong>{result.engine}:</strong> {result.error}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🔍 Technical Details</h3>
              <div className="space-y-2 text-sm text-blue-700">
                {results.filter(r => r.success).map((result, index) => (
                  <div key={index}>
                    <strong>{result.engine}:</strong> Search Method: {result.searchMethod}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
