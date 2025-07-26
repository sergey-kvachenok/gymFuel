'use client';
import { useState, useEffect } from 'react';
import { trpc } from '../../../../../lib/trpc-client';
import MealsList from '../MealsList';

export default function TodaysMealsHybrid({ children }: { children: React.ReactNode }) {
  const [showClientData, setShowClientData] = useState(false);
  const { data: clientConsumptions, isLoading } = trpc.consumption.getByDate.useQuery({});

  useEffect(() => {
    if (clientConsumptions) {
      setShowClientData(true);
    }
  }, [clientConsumptions]);

  // Показываем server data при первой загрузке
  if (!showClientData) {
    return <>{children}</>;
  }

  // Показываем client data при обновлениях
  return (
    <MealsList
      consumptions={clientConsumptions}
      isLoading={isLoading}
      title="Today's Meals"
      showActions={true}
    />
  );
}
