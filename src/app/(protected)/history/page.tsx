import { createTrpcServer } from '../../../lib/trpc-server';
import { getCurrentUserId } from '../../../lib/auth-utils';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  let history = null;
  let error = null;
  let userId = null;

  try {
    const trpcServer = await createTrpcServer();
    userId = await getCurrentUserId();
    history = await trpcServer.consumption.getHistory({ days: 30 });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error loading history';
  }

  return (
    <div className="max-w-6xl mx-auto" data-testid="history-page">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nutrition History</h1>
        <p className="text-gray-600">Track your daily nutrition over time</p>
      </div>

      <HistoryClient initialHistory={history} initialError={error} userId={userId} />
    </div>
  );
}
