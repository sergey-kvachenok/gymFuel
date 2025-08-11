'use client';
import { useConsumptionsByDate } from '../../../../../hooks/use-consumptions-by-date';
import MealsList from '../MealsList';
import { ConsumptionItem } from '../../../../../types/api';

interface TodaysMealsProps {
  userId: number | null;
}

export default function TodaysMeals({ userId }: TodaysMealsProps) {
  // Always use the hook data for real-time updates
  const { data: consumptions = [], isLoading } = useConsumptionsByDate(userId);

  console.log('TodaysMeals: Received consumptions:', consumptions.length, 'items:', consumptions);

  return (
    <div data-testid="todays-meals">
      <MealsList
        consumptions={consumptions as ConsumptionItem[]}
        isLoading={isLoading}
        title="Today's Meals"
        showActions={true}
        userId={userId}
      />
    </div>
  );
}
