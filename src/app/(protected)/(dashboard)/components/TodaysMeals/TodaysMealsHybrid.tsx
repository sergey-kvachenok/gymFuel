'use client';
import MealsList from '../MealsList';
import ClientOnly from '@/components/ClientOnly';
import { useConsumption } from '@/hooks/use-consumption';

export default function TodaysMealsHybrid({ children }: { children: React.ReactNode }) {
  const { consumption, isLoading } = useConsumption();

  return (
    <ClientOnly fallback={<>{children}</>}>
      <MealsList
        consumptions={consumption}
        isLoading={isLoading}
        title="Today's Meals"
        showActions={true}
      />
    </ClientOnly>
  );
}
