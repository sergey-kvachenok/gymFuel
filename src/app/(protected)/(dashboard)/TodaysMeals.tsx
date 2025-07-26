'use client';
import { trpc } from '../../../lib/trpc-client';
import MealsList from './MealsList';

export default function TodaysMeals() {
  const { data: consumptions, isLoading, error } = trpc.consumption.getByDate.useQuery({});

  console.log('consumptions', consumptions);

  return (
    <MealsList
      consumptions={consumptions}
      isLoading={isLoading}
      error={error?.message}
      showActions={true}
    />
  );
}
