"use client";

import { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, HomeIcon } from '@heroicons/react/24/outline';
import { SubjectProperty } from '@/types';
import { validatePropertyData } from '@/lib/utils';

interface PropertySearchProps {
  onSearch?: (property: SubjectProperty) => void;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [formData, setFormData] = useState<Partial<SubjectProperty>>({
    address: '',
    propertyType: 'Single Family',
    structureType: 'Detached',
    gla: 0,
    lotSize: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: 0,
    condition: 'Good',
    quality: 'Average',
    appraisalDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof SubjectProperty, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    const validationErrors = validatePropertyData(formData);
    console.log('Validation errors:', validationErrors);
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      console.log('Validation failed, not proceeding with search');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use dynamic coordinates based on address, fallback to NYC coordinates
      const coordinates = getCoordinatesForAddress(formData.address || '');
      
      const subjectProperty: SubjectProperty = {
        ...formData,
        id: `subject-${Date.now()}`,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        neighborhood: extractNeighborhood(formData.address || ''),
      } as SubjectProperty;
      
      console.log('Calling onSearch with:', subjectProperty);
      onSearch?.(subjectProperty);
    } catch (error) {
      console.error('Error submitting property search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract coordinates based on address
  const getCoordinatesForAddress = (address: string) => {
    // Basic address-to-coordinate mapping for demo
    const addressLower = address.toLowerCase();
    
    if (addressLower.includes('manhattan') || addressLower.includes('new york')) {
      return { lat: 40.7589, lng: -73.9851 }; // Manhattan, NY
    } else if (addressLower.includes('springfield')) {
      return { lat: 39.7817, lng: -89.6501 }; // Springfield, IL
    } else if (addressLower.includes('brooklyn')) {
      return { lat: 40.6782, lng: -73.9442 }; // Brooklyn, NY
    } else if (addressLower.includes('queens')) {
      return { lat: 40.7282, lng: -73.7949 }; // Queens, NY
    } else {
      // Default to Manhattan coordinates
      return { lat: 40.7589, lng: -73.9851 };
    }
  };

  // Helper function to extract neighborhood from address
  const extractNeighborhood = (address: string) => {
    const addressLower = address.toLowerCase();
    
    if (addressLower.includes('manhattan')) return 'Manhattan';
    if (addressLower.includes('brooklyn')) return 'Brooklyn';
    if (addressLower.includes('queens')) return 'Queens';
    if (addressLower.includes('bronx')) return 'Bronx';
    if (addressLower.includes('springfield')) return 'Springfield';
    
    // Extract city from address (assuming format: "123 Street, City, State")
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    
    return 'Unknown';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <HomeIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subject Property Details</h2>
          <p className="text-gray-600">Enter the property details to find comparable properties</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Address *
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St, City, State ZIP"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Property Type and Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
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
              Structure Type *
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
              GLA (sq ft) *
            </label>
            <input
              type="number"
              value={formData.gla || ''}
              onChange={(e) => handleInputChange('gla', parseInt(e.target.value) || 0)}
              placeholder="2500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lot Size (sq ft) *
            </label>
            <input
              type="number"
              value={formData.lotSize || ''}
              onChange={(e) => handleInputChange('lotSize', parseInt(e.target.value) || 0)}
              placeholder="8000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms *
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
              Bathrooms *
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
              placeholder="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Year Built and Condition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Built *
            </label>
            <input
              type="number"
              value={formData.yearBuilt || ''}
              onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
              placeholder="2010"
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
              <option value="Below Average">Below Average</option>
            </select>
          </div>
        </div>

        {/* Appraisal Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appraisal Date
            </label>
            <input
              type="date"
              value={formData.appraisalDate || ''}
              onChange={(e) => handleInputChange('appraisalDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            {isLoading ? 'Analyzing...' : 'Find Comparable Properties'}
          </button>
        </div>
      </form>
    </div>
  );
}