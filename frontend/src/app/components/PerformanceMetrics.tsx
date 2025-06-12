"use client";

export function PerformanceMetrics() {
  // Placeholder metrics for demo
  const metrics = {
    accuracy: 0.82,
    precision: 0.78,
    recall: 0.75,
    f1Score: 0.76,
    totalAppraisals: 100,
    correctPredictions: 82,
    averageScore: 74.5,
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Model Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Accuracy</p>
          <p className="text-2xl font-bold text-blue-700">{(metrics.accuracy * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Precision</p>
          <p className="text-2xl font-bold text-green-700">{(metrics.precision * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Recall</p>
          <p className="text-2xl font-bold text-yellow-700">{(metrics.recall * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">F1 Score</p>
          <p className="text-2xl font-bold text-purple-700">{(metrics.f1Score * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Appraisals</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.totalAppraisals}</p>
        </div>
        <div className="bg-pink-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Correct Predictions</p>
          <p className="text-2xl font-bold text-pink-700">{metrics.correctPredictions}</p>
        </div>
      </div>
      <div className="bg-blue-100 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-900 font-medium">Average Comp Score</p>
        <p className="text-2xl font-bold text-blue-900">{metrics.averageScore.toFixed(1)}</p>
      </div>
    </div>
  );
}
