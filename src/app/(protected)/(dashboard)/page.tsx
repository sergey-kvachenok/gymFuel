import { createTrpcServer } from '../../../lib/trpc-server';
import { getCurrentUserId } from '../../../lib/auth-utils';
import DailyStats from './components/DailyStats';
import TodaysMealsServer from './components/TodaysMeals/TodaysMealsServer';
import TodaysMealsHybrid from './components/TodaysMeals/TodaysMealsHybrid';
import GoalsProgress from './components/GoalsProgress';
import ConsumptionManager from './components/Consumption/ConsumptionManager';

export default async function DashboardPage() {
  let meals = null;
  let error = null;
  let userId = null;

  try {
    const trpcServer = await createTrpcServer();
    userId = await getCurrentUserId();
    meals = await trpcServer.consumption.getByDate({});
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error loading data';
  }

  return (
    <div className="flex flex-col gap-4">
      <DailyStats userId={userId} />
      <ConsumptionManager userId={userId} />

      <TodaysMealsHybrid userId={userId}>
        <TodaysMealsServer meals={meals || undefined} error={error} />
      </TodaysMealsHybrid>

      <GoalsProgress userId={userId} />
    </div>
  );
}
