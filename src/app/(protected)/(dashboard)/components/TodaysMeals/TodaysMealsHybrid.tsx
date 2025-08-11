'use client';
import { useConsumptionsByDate } from '../../../../../hooks/use-consumptions-by-date';
import MealsList from '../MealsList';
import ClientOnly from '@/components/ClientOnly';

interface TodaysMealsHybridProps {
  children: React.ReactNode;
  userId: number | null;
}

export default function TodaysMealsHybrid({ children, userId }: TodaysMealsHybridProps) {
  // Use hybrid hook for offline/online data
  const { data: clientConsumptions = [], isLoading } = useConsumptionsByDate(userId);

  return (
    <ClientOnly fallback={<>{children}</>}>
      <MealsList
        consumptions={clientConsumptions}
        isLoading={isLoading}
        title="Today's Meals"
        showActions={true}
      />
    </ClientOnly>
  );
}
