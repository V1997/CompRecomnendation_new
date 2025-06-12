"use client";

import { CompProperty, Explanation } from '@/types';
import { formatCurrency, formatNumber, formatDate, getScoreBadgeColor, calculateDaysSince } from '@/lib/utils';
import { MapPinIcon, CalendarIcon, HomeIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: CompProperty;
  rank: number;
  score: number;
  explanations: Explanation[];
  onSelect: () => void;
  isSelected: boolean;
}

export function PropertyCard({ 
  property, 
  rank, 
  score, 
  explanations, 
  onSelect, 
  isSelected 
}: PropertyCardProps) {
  const daysSinceSale = property.saleDate ? calculateDaysSince(property.saleDate) : null;
  const totalAdjustments = property.adjustments ? 
    Object.values(property.adjustments).reduce((sum, adj) => sum + adj, 0) : 0;
  const adjustedPrice = property.salePrice ? property.salePrice + totalAdjustments : 0;

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      {/* Header with Rank and Score */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="font-bold text-blue-600">#{rank}</span>
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">Comparable Property</p>
              <p className="font-semibold">Match Score</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(score)}`}>
            {score.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{property.address}</p>
              {property.neighborhood && (
                <p className="text-sm text-gray-600">{property.neighborhood}</p>
              )}
              <p className="text-xs text-gray-500">
                {property.distanceFromSubject.toFixed(1)} miles away
              </p>
            </div>
          </div>

          {/* Sale Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Sale Price</p>
              <p className="text-lg font-bold text-gray-900">
                {property.salePrice ? formatCurrency(property.salePrice) : 'N/A'}
              </p>
              {totalAdjustments !== 0 && (
                <p className="text-xs text-gray-600">
                  Adj: {totalAdjustments > 0 ? '+' : ''}{formatCurrency(totalAdjustments)}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Sale Date</p>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">
                  {property.saleDate ? formatDate(property.saleDate) : 'N/A'}
                </p>
              </div>
              {daysSinceSale && (
                <p className="text-xs text-gray-600">{daysSinceSale} days ago</p>
              )}
            </div>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <HomeIcon className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Features</p>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{property.bedrooms} BR, {property.bathrooms} BA</p>
                <p>{formatNumber(property.gla)} sq ft</p>
                <p>{formatNumber(property.lotSize)} sq ft lot</p>
                <p>Built {property.yearBuilt}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-2">
                <ChartBarIcon className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Quality</p>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Type: {property.propertyType}</p>
                <p>Condition: {property.condition}</p>
                <p>Quality: {property.quality}</p>
                <p>Structure: {property.structureType}</p>
              </div>
            </div>
          </div>

          {/* Key Factors */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Key Similarity Factors</p>
            <div className="space-y-1">
              {explanations.slice(0, 3).map((explanation, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{explanation.factor}</span>
                  <span className="text-xs font-medium text-gray-900">
                    {explanation.contribution.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Adjusted Value */}
          {adjustedPrice > 0 && totalAdjustments !== 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">Adjusted Value</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(adjustedPrice)}</p>
                <p className="text-xs text-blue-700">
                  Original: {formatCurrency(property.salePrice || 0)} 
                  {totalAdjustments > 0 ? ' + ' : ' - '}
                  {formatCurrency(Math.abs(totalAdjustments))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click to View Details */}
      <div className="px-6 pb-4">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
          Click to view detailed analysis →
        </button>
      </div>
    </div>
  );
}