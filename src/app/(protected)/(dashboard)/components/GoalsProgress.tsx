'use client';
import { FC } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { trpc } from '../../../../lib/trpc-client';

const COLORS = {
  calories: '#3b82f6', // blue-500
  protein: '#22c55e', // green-500
  fat: '#eab308', // yellow-500
  carbs: '#8b5cf6', // violet-500
  overGoal: '#ef4444', // red-500
  text: {
    calories: '#1d4ed8', // blue-700
    protein: '#15803d', // green-700
    fat: '#a16207', // yellow-700
    carbs: '#8b5cf6', // violet-500
  },
} as const;

export const GoalsProgress: FC = () => {
  const { data: goals, isLoading: goalsLoading } = trpc.goals.get.useQuery();
  const { data: currentStats, isLoading: statsLoading } = trpc.consumption.getDailyStats.useQuery(
    {},
  );

  if (goalsLoading || statsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Daily Goals Progress</h2>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Daily Goals Progress</h2>
        <div className="text-center py-6">
          <div className="text-gray-500 mb-4">No nutrition goals set yet</div>
          <a
            href="/goals"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Set Your Goals
          </a>
        </div>
      </div>
    );
  }

  const current = currentStats || { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 };

  const progressData = [
    {
      name: 'Calories',
      current: Math.round(current.totalCalories),
      goal: Math.round(goals.dailyCalories),
      unit: '',
      color: COLORS.calories,
      textColor: COLORS.text.calories,
    },
    {
      name: 'Protein',
      current: Math.round(current.totalProtein * 10) / 10,
      goal: Math.round(goals.dailyProtein * 10) / 10,
      unit: 'g',
      color: COLORS.protein,
      textColor: COLORS.text.protein,
    },
    {
      name: 'Fat',
      current: Math.round(current.totalFat * 10) / 10,
      goal: Math.round(goals.dailyFat * 10) / 10,
      unit: 'g',
      color: COLORS.fat,
      textColor: COLORS.text.fat,
    },
    {
      name: 'Carbs',
      current: Math.round(current.totalCarbs * 10) / 10,
      goal: Math.round(goals.dailyCarbs * 10) / 10,
      unit: 'g',
      color: COLORS.carbs,
      textColor: COLORS.text.carbs,
    },
  ];

  return (
    <Card>
      <CardTitle className="flex justify-between items-center mb-4">
        Daily Goals Progress
        <p className="text-xs text-gray-500 capitalize">Goal: {goals.goalType} weight</p>
      </CardTitle>

      <div className="space-y-2">
        {progressData.map((item) => {
          const percentage = Math.min((item.current / item.goal) * 100, 100);
          const isOverGoal = item.current > item.goal;

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="font-semibold" style={{ color: item.textColor }}>
                  {item.current}
                  {item.unit} / {item.goal}
                  {item.unit}
                  {isOverGoal && ' ⚠️'}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: isOverGoal ? COLORS.overGoal : item.color,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span className="font-medium">{Math.round(percentage)}% completed</span>
                {isOverGoal && (
                  <span className="text-red-600 font-medium">
                    +{Math.round((item.current - item.goal) * 10) / 10}
                    {item.unit} over goal
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <a href="/goals" className="text-blue-600 hover:text-blue-700 transition-colors">
            Edit Goals →
          </a>
        </div>
      </div>
    </Card>
  );
};

export default GoalsProgress;
