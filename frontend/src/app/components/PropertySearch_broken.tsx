"use client";

import { useState } from 'react';
import { SubjectProperty } from '@/types';

interface PropertySearchProps {
  onSearch?: (property: SubjectProperty) => void;
}

export function PropertySearchEnhanced({ onSearch }: PropertySearchProps) {
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
    console.log('Form submitted with data:', formData);
    setIsLoading(true);
    
    // Create subject property for callback
    const subjectProperty: SubjectProperty = {
      id: 'subject-001',
      address: formData.address || '',
      propertyType: formData.propertyType || 'Single Family',
      structureType: formData.structureType || 'Detached',
      gla: Number(formData.gla) || 0,
      lotSize: Number(formData.lotSize) || 0,
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      yearBuilt: Number(formData.yearBuilt) || 2000,
      condition: formData.condition || 'Good',
      quality: formData.quality || 'Average',
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      neighborhood: 'Calgary',
      features: [],
      appraisalDate: formData.appraisalDate || new Date().toISOString().split('T')[0],
      estimatedValue: Number(formData.estimatedValue) || 0,
    };

    if (onSearch) {
      onSearch(subjectProperty);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Search - Enhanced Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="789 Calgary Trail, Calgary, AB"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Search Properties'}
          </button>
        </div>
      </form>
    </div>
  );
}
