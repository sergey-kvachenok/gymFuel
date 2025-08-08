import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nutrition History</h1>
        <p className="text-gray-600">Track your daily nutrition over time</p>
      </div>

      <HistoryClient />
    </div>
  );
}
