"use client";

import { useState } from 'react';
import { SubjectProperty } from '@/types';

interface PropertySearchProps {
  onSearch?: (property: SubjectProperty) => void;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [formData, setFormData] = useState<Partial<SubjectProperty>>({
    address: '789 Calgary Trail, Calgary, AB',
    structureType: 'Detached',
    gla: 2400,
    lotSize: 6000,
    bedrooms: 4,
    bathrooms: 3.0,
    yearBuilt: 2010,
    estimatedValue: 550000,
    latitude: 51.0447,  // Calgary coordinates
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
    
    try {
      // Get coordinates for the address
      const coordinates = getCoordinatesForAddress(formData.address || '');
      
      // Create subject property for API - streamlined to match ML usage
      const subjectProperty: SubjectProperty = {
        id: 'subject-001',
        address: formData.address || '',
        structureType: formData.structureType || 'Detached',
        gla: formData.gla || 0,
        lotSize: formData.lotSize || 0,
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        yearBuilt: formData.yearBuilt || 0,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        estimatedValue: formData.estimatedValue || 0,
      };
      
      console.log('🔍 Calling onSearch with:', subjectProperty);
      onSearch?.(subjectProperty);
    } catch (error) {
      console.error('Error submitting property search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get coordinates for Canadian cities
  const getCoordinatesForAddress = (address: string) => {
    const addressLower = address.toLowerCase();
    
    if (addressLower.includes('toronto')) {
      return { lat: 43.6532, lng: -79.3832 }; // Toronto, ON
    } else if (addressLower.includes('vancouver')) {
      return { lat: 49.2827, lng: -123.1207 }; // Vancouver, BC
    } else if (addressLower.includes('calgary')) {
      return { lat: 51.0447, lng: -114.0719 }; // Calgary, AB
    } else if (addressLower.includes('ottawa')) {
      return { lat: 45.4215, lng: -75.6972 }; // Ottawa, ON
    } else if (addressLower.includes('montreal')) {
      return { lat: 45.5017, lng: -73.5673 }; // Montreal, QC
    } else if (addressLower.includes('edmonton')) {
      return { lat: 53.5461, lng: -113.4938 }; // Edmonton, AB
    } else if (addressLower.includes('winnipeg')) {
      return { lat: 49.8951, lng: -97.1384 }; // Winnipeg, MB
    } else if (addressLower.includes('kingston')) {
      return { lat: 44.2312, lng: -76.4860 }; // Kingston, ON
    } else {
      // Default to Toronto coordinates
      return { lat: 43.6532, lng: -79.3832 };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          🏠
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subject Property Details</h2>
          <p className="text-gray-600">Enter essential property details for ML-powered comparable matching</p>
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

        {/* Structure Type */}
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

        {/* Size and Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GLA (sq ft)
            </label>
            <input
              type="number"
              value={formData.gla || ''}
              onChange={(e) => handleInputChange('gla', parseInt(e.target.value) || 0)}
              placeholder="2400"
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
              onChange={(e) => handleInputChange('lotSize', parseInt(e.target.value) || 0)}
              placeholder="6000"
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
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
              placeholder="4"
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
              onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
              placeholder="3.0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Property Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year Built
          </label>
          <input
            type="number"
            value={formData.yearBuilt || ''}
            onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
            placeholder="2010"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Estimated Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Value (CAD)
          </label>
          <input
            type="number"
            value={formData.estimatedValue || ''}
            onChange={(e) => handleInputChange('estimatedValue', parseInt(e.target.value) || 0)}
            placeholder="550000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
