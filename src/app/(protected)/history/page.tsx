import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  // Remove SSR data fetching to avoid offline issues
  // Let the client handle all data fetching with offline support
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
