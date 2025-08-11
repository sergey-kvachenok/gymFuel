import { getCurrentUserId } from '../../../lib/auth-utils';
import DailyStats from './components/DailyStats';
import TodaysMeals from './components/TodaysMeals/TodaysMeals';
import GoalsProgress from './components/GoalsProgress';
import ConsumptionManager from './components/Consumption/ConsumptionManager';

export default async function DashboardPage() {
  let userId = null;

  try {
    userId = await getCurrentUserId();
  } catch (err) {
    console.error('Error getting user ID:', err);
  }

  return (
    <div className="flex flex-col gap-4">
      <DailyStats userId={userId} />
      <ConsumptionManager userId={userId} />

      <TodaysMeals userId={userId} />

      <GoalsProgress userId={userId} />
    </div>
  );
}
