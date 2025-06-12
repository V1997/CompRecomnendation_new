"use client";

import { BuildingOffice2Icon, ChartBarIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOffice2Icon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PropertyComps AI</h1>
              <p className="text-sm text-gray-600">Intelligent Property Valuation System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CpuChipIcon className="w-5 h-5" />
              <span>ML-Powered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ChartBarIcon className="w-5 h-5" />
              <span>Real-time Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}