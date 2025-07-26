'use client';
import { Card } from '@/components/ui/card';
import { trpc } from '../../../lib/trpc-client';

type GoalsProgressProps = {
  currentStats: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
  } | null;
};

export default function GoalsProgress({ currentStats }: GoalsProgressProps) {
  const { data: goals, isLoading } = trpc.goals.get.useQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Daily Goals Progress</h2>
        <div className="text-gray-500">Loading goals...</div>
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
      color: 'blue',
    },
    {
      name: 'Protein',
      current: Math.round(current.totalProtein * 10) / 10,
      goal: Math.round(goals.dailyProtein * 10) / 10,
      unit: 'g',
      color: 'green',
    },
    {
      name: 'Fat',
      current: Math.round(current.totalFat * 10) / 10,
      goal: Math.round(goals.dailyFat * 10) / 10,
      unit: 'g',
      color: 'yellow',
    },
    {
      name: 'Carbs',
      current: Math.round(current.totalCarbs * 10) / 10,
      goal: Math.round(goals.dailyCarbs * 10) / 10,
      unit: 'g',
      color: 'red',
    },
  ];

  const getProgressColor = (percentage: number, baseColor: string) => {
    if (percentage >= 100) return `bg-${baseColor}-600`;
    if (percentage >= 80) return `bg-${baseColor}-500`;
    if (percentage >= 50) return `bg-${baseColor}-400`;
    return `bg-${baseColor}-300`;
  };

  const getTextColor = (baseColor: string) => `text-${baseColor}-700`;

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Daily Goals Progress</h2>
        <div className="text-sm text-gray-500 capitalize">Goal: {goals.goalType} weight</div>
      </div>

      <div className="space-y-4">
        {progressData.map((item) => {
          const percentage = Math.min((item.current / item.goal) * 100, 100);
          const isOverGoal = item.current > item.goal;

          return (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className={`font-semibold ${getTextColor(item.color)}`}>
                  {item.current}
                  {item.unit} / {item.goal}
                  {item.unit}
                  {isOverGoal && ' ⚠️'}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOverGoal ? `bg-red-500` : getProgressColor(percentage, item.color)
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(percentage)}% completed</span>
                {isOverGoal && (
                  <span className="text-red-600">
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
}
