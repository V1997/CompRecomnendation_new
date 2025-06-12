"use client";

import { useState } from 'react';
import { Header } from "./components/Header";
import { PropertySearch } from "./components/PropertySearch";
import { Dashboard } from "./components/Dashboard";
import { CompRecommendation, SubjectProperty, AppraisalResponse } from '@/types';
import { propertyAPI } from '@/lib/api';
import { calculateDistance, calculateDaysSince } from '@/lib/utils';

export default function Home() {
  const [subjectProperty, setSubjectProperty] = useState<SubjectProperty | null>(null);
  const [recommendations, setRecommendations] = useState<CompRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePropertySearch = async (property: SubjectProperty) => {
    console.log('handlePropertySearch called with:', property);
    setSubjectProperty(property);
    setIsLoading(true);
    setError(null);

    try {
      // Transform frontend data to backend API format
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
        neighborhood: property.neighborhood,
        features: property.features || [],
        appraisal_date: new Date(property.appraisalDate).toISOString(),
        estimated_value: property.estimatedValue,
      };

      console.log('Calling Smart API with subject property:', apiSubjectProperty);
      
      // Use Smart API that automatically finds candidates from the 10,000+ property dataset
      const response = await propertyAPI.getSmartRecommendations(apiSubjectProperty);
      console.log('Smart API response received:', response);
      
      // Transform backend response to frontend format
      const transformedRecommendations: CompRecommendation[] = response.recommendations.map(rec => {
        // Calculate distance and days since sale on frontend (backend provides them too)
        const distance = rec.property.distance_from_subject || calculateDistance(
          property.latitude,
          property.longitude,
          rec.property.latitude,
          rec.property.longitude
        );
        const daysSinceSale = rec.property.days_since_sale || (rec.property.sale_date ? calculateDaysSince(rec.property.sale_date) : 999);

        return {
          property: {
            id: rec.property.id,
            address: rec.property.address,
            saleDate: rec.property.sale_date,
            salePrice: rec.property.sale_price,
            propertyType: rec.property.property_type,
            structureType: rec.property.structure_type,
            gla: rec.property.gla,
            lotSize: rec.property.lot_size,
            bedrooms: rec.property.bedrooms,
            bathrooms: rec.property.bathrooms,
            yearBuilt: rec.property.year_built,
            condition: rec.property.condition,
            quality: rec.property.quality,
            latitude: rec.property.latitude,
            longitude: rec.property.longitude,
            neighborhood: rec.property.neighborhood,
            features: rec.property.features,
            similarityScore: rec.overall_score, // Use overall_score from ML model
            distanceFromSubject: distance,
            daysSinceSale: daysSinceSale,
            adjustments: {
              glaAdjustment: (rec.property.gla - property.gla) * 50,
              lotSizeAdjustment: (rec.property.lot_size - property.lotSize) * 5,
              conditionAdjustment: rec.property.condition === property.condition ? 0 : 5000,
              locationAdjustment: distance > 1 ? -2000 : 0,
              timeAdjustment: daysSinceSale > 90 ? -3000 : 0,
            },
          },
          rank: rec.rank,
          overallScore: rec.overall_score,
          explanations: rec.explanations,
          reasoning: rec.reasoning,
        };
      });

      console.log('Setting recommendations:', transformedRecommendations);
      setRecommendations(transformedRecommendations);

    } catch (err) {
      console.error('Smart API call failed:', err);
      setError('Unable to find comparable properties from our dataset. Please try adjusting your search criteria or try again later.');
      setRecommendations([]); // Clear any previous recommendations
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <PropertySearch onSearch={handlePropertySearch} />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg font-medium text-gray-700">
                  Searching our database of 10,000+ properties...
                </span>
              </div>
            </div>
          )}

          {subjectProperty && recommendations.length > 0 && !isLoading && (
            <Dashboard 
              subjectProperty={subjectProperty}
              recommendations={recommendations}
            />
          )}

          {subjectProperty && recommendations.length === 0 && !isLoading && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No Comparable Properties Found</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>We searched our database of 10,000+ properties but couldn't find suitable comparable properties for your search criteria. Try expanding your search area or adjusting the property details.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
