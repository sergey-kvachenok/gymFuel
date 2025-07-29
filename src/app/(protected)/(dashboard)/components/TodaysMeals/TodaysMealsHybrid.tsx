'use client';
import { trpc } from '../../../../../lib/trpc-client';
import MealsList from '../MealsList';
import ClientOnly from '@/components/ClientOnly';

export default function TodaysMealsHybrid({ children }: { children: React.ReactNode }) {
  const { data: clientConsumptions, isLoading } = trpc.consumption.getByDate.useQuery({});

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
