'use client';

import { FC } from 'react';
import { useOfflineDailyStats } from '@/hooks/use-offline-consumption';
import { statsFields } from '@/constants/DailyStats.constants';
import StatsCardMessage from '@/components/GenericStatsCard';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

type StatsKey = 'totalCalories' | 'totalProtein' | 'totalFat' | 'totalCarbs';

const DailyStats: FC = () => {
  const { data: stats, error, isLoading } = useOfflineDailyStats({});

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
