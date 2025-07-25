'use client';

import { FC } from 'react';
import { trpc } from '../../lib/trpc-client';
import { statsFields } from '@/constants/DailyStats.constants';
import StatsCardMessage from '@/components/GenericStatsCard';

type StatsKey = 'totalCalories' | 'totalProtein' | 'totalFat' | 'totalCarbs';

const DailyStats: FC = () => {
  const { data: stats, error, isLoading } = trpc.consumption.getDailyStats.useQuery({});

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

  if (!stats) {
    return <StatsCardMessage title="Daily Nutrition" message="No data available" />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <h2 className="text-xl font-bold mb-4">Daily Nutrition</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsFields.map((field) => (
          <div className="text-center" key={field.title}>
            <div className={`text-2xl font-bold ${field.color}`}>
              {field.format(stats[field.key as StatsKey])}
              {field.unit}
            </div>
            <div className="text-sm text-gray-600">{field.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyStats;
