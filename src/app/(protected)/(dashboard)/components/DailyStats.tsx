'use client';

import { FC } from 'react';
import { statsFields } from '@/constants/DailyStats.constants';
import StatsCardMessage from '@/components/GenericStatsCard';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useConsumptionsByDate } from '../../../../hooks/use-consumptions-by-date';

type StatsKey = 'totalCalories' | 'totalProtein' | 'totalFat' | 'totalCarbs';

interface DailyStatsProps {
  userId: number | null;
}

const DailyStats: FC<DailyStatsProps> = ({ userId }) => {
  // Use hybrid hook for offline/online data
  const { data: consumptions, error, isLoading } = useConsumptionsByDate(userId);

  if (isLoading) {
    return <StatsCardMessage title="Daily Nutrition" message="Loading..." />;
  }

  if (error) {
    return (
      <StatsCardMessage
        title="Daily Nutrition"
        message={error.message || String(error)}
        color="text-red-500"
      />
    );
  }

  // Calculate stats from consumptions
  const stats = consumptions
    ? consumptions.reduce(
        (acc, consumption) => {
          const ratio = consumption.amount / 100;
          acc.totalCalories += consumption.product.calories * ratio;
          acc.totalProtein += consumption.product.protein * ratio;
          acc.totalFat += consumption.product.fat * ratio;
          acc.totalCarbs += consumption.product.carbs * ratio;
          acc.consumptionsCount += 1;
          return acc;
        },
        {
          date: new Date().toISOString().split('T')[0],
          totalCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          consumptionsCount: 0,
        },
      )
    : null;

  return (
    <Card>
      <CardTitle>Daily Nutrition</CardTitle>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {!stats ? (
          <div className="text-center">No data available</div>
        ) : (
          statsFields.map((field) => (
            <div className="text-center" key={field.title}>
              <div className={`text-2xl font-bold ${field.color}`}>
                {field.format(stats[field.key as StatsKey])}
                {field.unit}
              </div>
              <div className="text-sm text-gray-600">{field.title}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DailyStats;
