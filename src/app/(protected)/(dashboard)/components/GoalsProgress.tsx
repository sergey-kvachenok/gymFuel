'use client';

import { FC } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { useNutritionGoals } from '../../../../hooks/use-nutrition-goals';
import { useConsumptionsByDate } from '../../../../hooks/use-consumptions-by-date';

const COLORS = {
  calories: '#ef4444', // red-500
  protein: '#3b82f6', // blue-500
  fat: '#eab308', // yellow-500
  carbs: '#8b5cf6', // violet-500
  text: {
    calories: '#dc2626', // red-600
    protein: '#2563eb', // blue-600
    fat: '#a16207', // yellow-700
    carbs: '#8b5cf6', // violet-500
  },
} as const;

interface GoalsProgressProps {
  userId: number | null;
}

export const GoalsProgress: FC<GoalsProgressProps> = ({ userId }) => {
  // Use hybrid hooks for offline/online data
  const { data: goals, isLoading: goalsLoading } = useNutritionGoals(userId);
  const { data: consumptions = [], isLoading: statsLoading } = useConsumptionsByDate(userId);

  // Calculate current stats from consumptions
  const currentStats = consumptions.reduce(
    (acc, consumption) => {
      const product = consumption.product;
      const quantity = consumption.amount / 100; // Convert from grams to 100g units
      return {
        totalCalories: acc.totalCalories + product.calories * quantity,
        totalProtein: acc.totalProtein + product.protein * quantity,
        totalFat: acc.totalFat + product.fat * quantity,
        totalCarbs: acc.totalCarbs + product.carbs * quantity,
      };
    },
    { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
  );

  if (goalsLoading || statsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border" data-testid="goals-progress">
        <h2 className="text-xl font-bold mb-4">Daily Goals Progress</h2>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border" data-testid="goals-progress">
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

  const current = currentStats;

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
    <Card data-testid="goals-progress">
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
                  className="h-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default GoalsProgress;
