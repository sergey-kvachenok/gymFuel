'use client';
import { useOfflineConsumption } from '@/hooks/use-offline-consumption';
import MealsList from '../MealsList';
import ClientOnly from '@/components/ClientOnly';
import { ConsumptionItem } from '@/types/api';

export default function TodaysMealsHybrid({ children }: { children: React.ReactNode }) {
  const { data: offlineConsumptions, isLoading } = useOfflineConsumption({});
  const clientConsumptions = offlineConsumptions as ConsumptionItem[];

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
