import { createTrpcServer } from '../../../lib/trpc-server';
import DailyStats from './components/DailyStats';
import TodaysMealsServer from './components/TodaysMeals/TodaysMealsServer';
import TodaysMealsHybrid from './components/TodaysMeals/TodaysMealsHybrid';
import GoalsProgress from './components/GoalsProgress';
import ConsumptionManager from './components/Consumption/ConsumptionManager';

export default async function DashboardPage() {
  let meals = null;
  let error = null;

  try {
    const trpcServer = await createTrpcServer();

    meals = await trpcServer.consumption.getByDate({});
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error loading data';
  }

  return (
    <div className="flex flex-col gap-4">
      <DailyStats />
      <ConsumptionManager />

      <TodaysMealsHybrid>
        <TodaysMealsServer meals={meals || undefined} error={error} />
      </TodaysMealsHybrid>

      <GoalsProgress />
    </div>
  );
}
