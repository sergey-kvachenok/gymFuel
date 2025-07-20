import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { createTrpcServer } from '../../lib/trpc-server';
import DashboardClient from './DashboardClient';
import DailyStats from './DailyStats';
import TodaysMealsServer from './TodaysMealsServer';
import TodaysMealsHybrid from './TodaysMealsHybrid';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center">Please login</div>;
  }

  // Создаём один trpc server и загружаем все данные параллельно
  let stats = null;
  let meals = null;
  let error = null;

  try {
    const trpcServer = await createTrpcServer();

    // Параллельная загрузка всех данных
    [stats, meals] = await Promise.all([
      trpcServer.consumption.getDailyStats({}),
      trpcServer.consumption.getByDate({}),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error loading data';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Daily Stats - передаём готовые данные */}
        <DailyStats stats={stats} error={error} />

        {/* Today's Meals - передаём готовые данные */}
        <TodaysMealsHybrid>
          <TodaysMealsServer meals={meals} error={error} />
        </TodaysMealsHybrid>

        {/* Client Components */}
        <DashboardClient session={session} />
      </div>
    </div>
  );
}
