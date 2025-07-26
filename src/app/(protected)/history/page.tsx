import { createTrpcServer } from '../../../lib/trpc-server';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  let history = null;
  let error = null;

  try {
    const trpcServer = await createTrpcServer();
    history = await trpcServer.consumption.getHistory({ days: 30 });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error loading history';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nutrition History</h1>
          <p className="text-gray-600">Track your daily nutrition over time</p>
        </div>

        <HistoryClient initialHistory={history} initialError={error} />
      </div>
    </div>
  );
}
