"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header without icons */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏠</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Property Valuation</h1>
                <p className="text-sm text-gray-500">Powered by Optimized Engine</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Recommendation System</h1>
        <p className="text-gray-600">Ready to add components back gradually.</p>
      </main>
    </div>
  );
}
