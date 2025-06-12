"use client";

import { useState } from 'react';
import { SubjectProperty, CompRecommendation, Explanation } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { 
  LightBulbIcon, 
  ChartBarIcon, 
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

interface ExplainabilityPanelProps {
  subjectProperty: SubjectProperty;
  selectedComp: CompRecommendation | null;
  recommendations: CompRecommendation[];
}

export function ExplainabilityPanel({ 
  subjectProperty, 
  selectedComp, 
  recommendations 
}: ExplainabilityPanelProps) {
  const [activeExplanation, setActiveExplanation] = useState<'overview' | 'factors' | 'comparison'>('overview');

  return (
    <div className="space-y-6">
      {/* AI Explanation Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <LightBulbIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Explanations</h2>
            <p className="opacity-90">Understanding how properties are matched and valued</p>
          </div>
        </div>
      </div>

      {/* Explanation Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveExplanation('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeExplanation === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveExplanation('factors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeExplanation === 'factors'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Key Factors
            </button>
            <button
              onClick={() => setActiveExplanation('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeExplanation === 'comparison'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Side-by-Side
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeExplanation === 'overview' && (
            <OverviewExplanation 
              subjectProperty={subjectProperty}
              recommendations={recommendations}
              selectedComp={selectedComp}
            />
          )}

          {activeExplanation === 'factors' && (
            <FactorsExplanation 
              subjectProperty={subjectProperty}
              selectedComp={selectedComp}
            />
          )}

          {activeExplanation === 'comparison' && (
            <ComparisonExplanation 
              subjectProperty={subjectProperty}
              recommendations={recommendations}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewExplanation({ 
  subjectProperty, 
  recommendations, 
  selectedComp 
}: {
  subjectProperty: SubjectProperty;
  recommendations: CompRecommendation[];
  selectedComp: CompRecommendation | null;
}) {
  const topRecommendation = recommendations[0];
  const averageScore = recommendations.reduce((sum, rec) => sum + rec.overallScore, 0) / recommendations.length;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Methodology Overview</h3>
        <p className="text-blue-800 mb-4">
          Our AI system analyzes properties using a sophisticated multi-factor scoring algorithm that considers:
        </p>
        <ul className="text-blue-800 space-y-2">
          <li>• <strong>Physical Similarity:</strong> Living area, lot size, bedrooms, bathrooms</li>
          <li>• <strong>Location Proximity:</strong> Distance from subject property</li>
          <li>• <strong>Temporal Relevance:</strong> How recent the sale occurred</li>
          <li>• <strong>Property Characteristics:</strong> Type, condition, quality, age</li>
          <li>• <strong>Market Adjustments:</strong> Price adjustments for differences</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-900 mb-3">Top Recommendation</h4>
          <div className="space-y-2 text-green-800">
            <p><strong>Address:</strong> {topRecommendation.property.address}</p>
            <p><strong>Match Score:</strong> {topRecommendation.overallScore.toFixed(1)}%</p>
            <p><strong>Sale Price:</strong> {formatCurrency(topRecommendation.property.salePrice || 0)}</p>
            <p><strong>Distance:</strong> {topRecommendation.property.distanceFromSubject.toFixed(1)} miles</p>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-yellow-900 mb-3">Quality Metrics</h4>
          <div className="space-y-2 text-yellow-800">
            <p><strong>Average Score:</strong> {averageScore.toFixed(1)}%</p>
            <p><strong>Score Range:</strong> {recommendations[recommendations.length - 1].overallScore.toFixed(1)}% - {recommendations[0].overallScore.toFixed(1)}%</p>
            <p><strong>Confidence Level:</strong> {averageScore > 70 ? 'High' : averageScore > 50 ? 'Medium' : 'Low'}</p>
            <p><strong>Data Recency:</strong> All sales within 90 days</p>
          </div>
        </div>
      </div>

      {selectedComp && (
        <div className="bg-purple-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-purple-900 mb-3">Selected Property Analysis</h4>
          <p className="text-purple-800 mb-3">{selectedComp.reasoning}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-purple-600">GLA Difference</p>
              <p className="font-semibold text-purple-900">
                {Math.abs(selectedComp.property.gla - subjectProperty.gla)} sq ft
              </p>
            </div>
            <div>
              <p className="text-purple-600">Lot Difference</p>
              <p className="font-semibold text-purple-900">
                {Math.abs(selectedComp.property.lotSize - subjectProperty.lotSize)} sq ft
              </p>
            </div>
            <div>
              <p className="text-purple-600">Age Difference</p>
              <p className="font-semibold text-purple-900">
                {Math.abs(selectedComp.property.yearBuilt - subjectProperty.yearBuilt)} years
              </p>
            </div>
            <div>
              <p className="text-purple-600">Days Since Sale</p>
              <p className="font-semibold text-purple-900">
                {selectedComp.property.daysSinceSale} days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FactorsExplanation({ 
  subjectProperty, 
  selectedComp 
}: {
  subjectProperty: SubjectProperty;
  selectedComp: CompRecommendation | null;
}) {
  if (!selectedComp) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Select a property to view detailed factor analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Factor Analysis: {selectedComp.property.address}
      </h3>

      <div className="space-y-4">
        {selectedComp.explanations.map((explanation, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{explanation.factor}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Weight: {(explanation.weight * 100).toFixed(0)}%</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {explanation.contribution.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-gray-700">{explanation.description}</p>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, explanation.contribution))}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedComp.property.adjustments && (
        <div className="bg-yellow-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
            <ScaleIcon className="w-5 h-5" />
            Price Adjustments
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(selectedComp.property.adjustments).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-yellow-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className={`font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {value >= 0 ? '+' : ''}{formatCurrency(value)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-200">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-yellow-900">Total Adjustment:</span>
              <span className="text-yellow-900">
                {Object.values(selectedComp.property.adjustments).reduce((sum, val) => sum + val, 0) >= 0 ? '+' : ''}
                {formatCurrency(Object.values(selectedComp.property.adjustments).reduce((sum, val) => sum + val, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonExplanation({ 
  subjectProperty, 
  recommendations 
}: {
  subjectProperty: SubjectProperty;
  recommendations: CompRecommendation[];
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Side-by-Side Comparison</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b"></th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                Subject Property
              </th>
              {recommendations.map((rec, index) => (
                <th key={rec.property.id} className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                  Comp #{index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-900">Address</td>
              <td className="px-4 py-3 text-sm text-gray-700">{subjectProperty.address}</td>
              {recommendations.map((rec) => (
                <td key={rec.property.id} className="px-4 py-3 text-sm text-gray-700">
                  {rec.property.address}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-900">GLA (sq ft)</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(subjectProperty.gla)}</td>
              {recommendations.map((rec) => (
                <td key={rec.property.id} className="px-4 py-3 text-sm text-gray-700">
                  {formatNumber(rec.property.gla)}
                  <span className={`ml-2 text-xs ${
                    rec.property.gla > subjectProperty.gla ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({rec.property.gla > subjectProperty.gla ? '+' : ''}{rec.property.gla - subjectProperty.gla})
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-900">Bedrooms</td>
              <td className="px-4 py-3 text-sm text-gray-700">{subjectProperty.bedrooms}</td>
              {recommendations.map((rec) => (
                <td key={rec.property.id} className="px-4 py-3 text-sm text-gray-700">
                  {rec.property.bedrooms}
                  {rec.property.bedrooms !== subjectProperty.bedrooms && (
                    <span className={`ml-2 text-xs ${
                      rec.property.bedrooms > subjectProperty.bedrooms ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({rec.property.bedrooms > subjectProperty.bedrooms ? '+' : ''}{rec.property.bedrooms - subjectProperty.bedrooms})
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-900">Sale Price</td>
              <td className="px-4 py-3 text-sm text-gray-700">-</td>
              {recommendations.map((rec) => (
                <td key={rec.property.id} className="px-4 py-3 text-sm text-gray-700">
                  {formatCurrency(rec.property.salePrice || 0)}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-900">Match Score</td>
              <td className="px-4 py-3 text-sm text-gray-700">-</td>
              {recommendations.map((rec) => (
                <td key={rec.property.id} className="px-4 py-3 text-sm text-gray-700">
                  <span className="font-semibold text-blue-600">
                    {rec.overallScore.toFixed(1)}%
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}