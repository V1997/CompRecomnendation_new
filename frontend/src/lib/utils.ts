import { Property, SubjectProperty, CompProperty } from '@/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

export const getPropertySimilarityScore = (
  subject: SubjectProperty,
  comp: Property
): number => {
  // Simple similarity scoring algorithm
  let score = 100;

  // GLA similarity (30% weight)
  const glaDiff = Math.abs(subject.gla - comp.gla) / subject.gla;
  score -= glaDiff * 30;

  // Lot size similarity (20% weight)
  const lotDiff = Math.abs(subject.lotSize - comp.lotSize) / subject.lotSize;
  score -= lotDiff * 20;

  // Bedroom similarity (15% weight)
  const bedroomDiff = Math.abs(subject.bedrooms - comp.bedrooms);
  score -= bedroomDiff * 5;

  // Bathroom similarity (15% weight)
  const bathroomDiff = Math.abs(subject.bathrooms - comp.bathrooms);
  score -= bathroomDiff * 7.5;

  // Age similarity (10% weight)
  const ageDiff = Math.abs(subject.yearBuilt - comp.yearBuilt) / 10;
  score -= ageDiff;

  // Property type match (10% weight)
  if (subject.propertyType !== comp.propertyType) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBadgeColor = (score: number): string => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export const validatePropertyData = (property: Partial<Property>): string[] => {
  const errors: string[] = [];

  if (!property.address) errors.push('Address is required');
  if (!property.propertyType) errors.push('Property type is required');
  if (!property.gla || property.gla <= 0) errors.push('Valid GLA is required');
  if (!property.lotSize || property.lotSize <= 0) errors.push('Valid lot size is required');
  if (!property.bedrooms || property.bedrooms <= 0) errors.push('Valid bedroom count is required');
  if (!property.bathrooms || property.bathrooms <= 0) errors.push('Valid bathroom count is required');
  if (!property.yearBuilt || property.yearBuilt < 1800 || property.yearBuilt > new Date().getFullYear()) {
    errors.push('Valid year built is required');
  }

  return errors;
};

export const generatePropertySummary = (property: Property): string => {
  return `${property.bedrooms}BR/${property.bathrooms}BA, ${formatNumber(property.gla)} sq ft, Built ${property.yearBuilt}`;
};

export const getRecentSalesFilter = (days: number = 90): (property: Property) => boolean => {
  return (property: Property) => {
    if (!property.saleDate) return false;
    return calculateDaysSince(property.saleDate) <= days;
  };
};

export const getSimilarPropertiesFilter = (
  subject: SubjectProperty,
  minScore: number = 60
): (property: Property) => boolean => {
  return (property: Property) => {
    return getPropertySimilarityScore(subject, property) >= minScore;
  };
};
