"use client";

import { useState } from 'react';
import { PropertySearchBasicForm } from "./components/PropertySearchBasicForm";
import { SubjectProperty, OptimizedAppraisalResponse } from '@/types';
import { propertyAPI } from '@/lib/api';

export default function Home() {
  const [test, setTest] = useState<string>("working");
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">PropertyComps AI</h1>
            <p className="text-gray-600 mb-4">Testing basic form: {test}</p>
            <p className="text-purple-600">📝 Basic PropertySearch form with useState and types</p>
          </div>
          
          <PropertySearchBasicForm />
        </div>
      </div>
    </div>
  );
}
