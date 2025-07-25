'use client';
import { useState, useEffect } from 'react';
import { trpc } from '../../../lib/trpc-client';
import Link from 'next/link';
import { RecommendationForm } from './components/RecommendationForm';
import { GoalType, IFormData } from './types';
import { CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const nutritionFields = [
  {
    key: 'dailyCalories',
    label: 'Daily Calories',
    min: 500,
    max: 10000,
    step: 1,
  },
  {
    key: 'dailyProtein',
    label: 'Daily Protein (g)',
    min: 10,
    max: 500,
    step: 0.1,
  },
  {
    key: 'dailyFat',
    label: 'Daily Fat (g)',
    min: 10,
    max: 300,
    step: 0.1,
  },
  {
    key: 'dailyCarbs',
    label: 'Daily Carbs (g)',
    min: 10,
    max: 1000,
    step: 0.1,
  },
];

export default function GoalsForm() {
  const [formData, setFormData] = useState<IFormData>({
    dailyCalories: 0,
    dailyProtein: 0,
    dailyFat: 0,
    dailyCarbs: 0,
    goalType: GoalType.Maintain,
  });

  const [showRecommendations, setShowRecommendations] = useState(true);

  const { data: currentGoals, isLoading } = trpc.goals.get.useQuery();
  const { data: recommendations, isLoading: isRecommendationsLoading } =
    trpc.goals.getRecommendations.useQuery(
      { goalType: formData.goalType },
      { enabled: showRecommendations },
    );

  const utils = trpc.useUtils();

  const saveGoalsMutation = trpc.goals.upsert.useMutation({
    onSuccess: () => {
      utils.goals.get.invalidate();
      alert('Goals saved successfully!');
    },
    onError: (error) => {
      alert(`Error saving goals: ${error.message}`);
    },
  });

  const deleteGoalsMutation = trpc.goals.delete.useMutation({
    onSuccess: () => {
      utils.goals.get.invalidate();
      alert('Goals deleted successfully!');
    },
    onError: (error) => {
      alert(`Error deleting goals: ${error.message}`);
    },
  });

  useEffect(() => {
    if (currentGoals) {
      setFormData({
        dailyCalories: currentGoals.dailyCalories,
        dailyProtein: currentGoals.dailyProtein,
        dailyFat: currentGoals.dailyFat,
        dailyCarbs: currentGoals.dailyCarbs,
        goalType: GoalType.Maintain,
      });
    }
  }, [currentGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoalsMutation.mutate(formData);
  };

  const handleUseRecommendations = () => {
    if (recommendations) {
      setFormData({
        ...formData,
        dailyCalories: recommendations.dailyCalories,
        dailyProtein: recommendations.dailyProtein,
        dailyFat: recommendations.dailyFat,
        dailyCarbs: recommendations.dailyCarbs,
        goalType: recommendations.goalType as GoalType,
      });
      setShowRecommendations(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <RecommendationForm
        handleUseRecommendations={handleUseRecommendations}
        formData={formData}
        setFormData={setFormData}
        setShowRecommendations={setShowRecommendations}
        recommendations={recommendations}
        isRecommendationsLoading={isRecommendationsLoading}
      />

      <div className=" rounded-2xl shadow-lg p-3 border">
        <CardTitle className="text-start mb-3">
          {currentGoals ? 'Edit Your Goals' : 'Set Your Goals'}
        </CardTitle>

        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nutritionFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>

                    <input
                      type="number"
                      value={formData[field.key as keyof typeof formData] as number}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 items-center justify-between flex-wrap ">
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saveGoalsMutation.isPending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saveGoalsMutation.isPending ? 'Saving...' : 'Save Goals'}
                  </Button>

                  {currentGoals && (
                    <Button
                      type="button"
                      onClick={() => deleteGoalsMutation.mutate()}
                      disabled={deleteGoalsMutation.isPending}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleteGoalsMutation.isPending ? 'Deleting...' : 'Delete Goals'}
                    </Button>
                  )}
                </div>

                <Link href="/">
                  <Button variant="outline" size="sm">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </div>
    </div>
  );
}
