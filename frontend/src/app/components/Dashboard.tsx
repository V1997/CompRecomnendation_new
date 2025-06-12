"use client";

import { useState } from 'react';
import { PropertyCard } from './PropertyCard';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { PerformanceMetrics } from './PerformanceMetrics';
import { ChartBarIcon, HomeIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { SubjectProperty, CompRecommendation } from '@/types';
import { formatCurrency, formatNumber, generatePropertySummary } from '@/lib/utils';

interface DashboardProps {
  subjectProperty: SubjectProperty;
  recommendations: CompRecommendation[];
}

export function Dashboard({ subjectProperty, recommendations }: DashboardProps) {
  const [selectedComp, setSelectedComp] = useState<CompRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'explanations' | 'metrics'>('recommendations');

  const averageScore = recommendations.reduce((sum, rec) => sum + rec.overallScore, 0) / recommendations.length;
  const highestScore = Math.max(...recommendations.map(rec => rec.overallScore));

  return (
    <div className="space-y-8">
      {/* Subject Property Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <HomeIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Subject Property</h2>
            <p className="text-gray-600">{subjectProperty.address}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Property Type</p>
            <p className="text-lg font-semibold text-gray-900">{subjectProperty.propertyType}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Living Area</p>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(subjectProperty.gla)} sq ft</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Lot Size</p>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(subjectProperty.lotSize)} sq ft</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Year Built</p>
            <p className="text-lg font-semibold text-gray-900">{subjectProperty.yearBuilt}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Top 3 Recommendations
            </div>
          </button>
          <button
            onClick={() => setActiveTab('explanations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'explanations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <LightBulbIcon className="w-5 h-5" />
              AI Explanations
            </div>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Performance Metrics
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">★</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Highest Score</p>
                  <p className="text-2xl font-bold text-gray-900">{highestScore.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">μ</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <PropertyCard
                key={recommendation.property.id}
                property={recommendation.property}
                rank={recommendation.rank}
                score={recommendation.overallScore}
                explanations={recommendation.explanations}
                onSelect={() => setSelectedComp(recommendation)}
                isSelected={selectedComp?.property.id === recommendation.property.id}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'explanations' && (
        <ExplainabilityPanel
          subjectProperty={subjectProperty}
          selectedComp={selectedComp}
          recommendations={recommendations}
        />
      )}

      {activeTab === 'metrics' && (
        <PerformanceMetrics />
      )}
    </div>
  );
}