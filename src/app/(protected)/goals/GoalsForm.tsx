'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { GoalType, IFormData } from './types';
import { CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UnifiedDataService } from '../../../lib/unified-data-service';
import { useNutritionGoals } from '../../../hooks/use-nutrition-goals';

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

/**
 * Props for the GoalsForm component
 */
interface GoalsFormProps {
  /** The current user's ID. Must be a valid number for authenticated users, null otherwise */
  userId: number | null;
}

export default function GoalsForm({ userId }: GoalsFormProps) {
  const [formData, setFormData] = useState<IFormData>({
    dailyCalories: 0,
    dailyProtein: 0,
    dailyFat: 0,
    dailyCarbs: 0,
    goalType: GoalType.Maintain,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentGoals, isLoading } = useNutritionGoals(userId);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!userId) {
      alert('User not authenticated');
      setIsSubmitting(false);
      return;
    }

    try {
      const unifiedDataService = UnifiedDataService.getInstance();

      if (currentGoals?.id) {
        // Update existing goals
        await unifiedDataService.updateNutritionGoals(currentGoals.id, {
          ...formData,
          userId,
        });
      } else {
        // Create new goals
        await unifiedDataService.createNutritionGoals({
          ...formData,
          userId,
        });
      }

      setIsSubmitting(false);
      alert('Goals saved successfully!');
    } catch (error) {
      setIsSubmitting(false);
      alert(`Error saving goals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex flex-col gap-3" data-testid="goals-form">
      {/* RecommendationForm removed for simplified approach */}

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
                    <label
                      htmlFor={`goals-${field.key}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {field.label}
                    </label>

                    <input
                      id={`goals-${field.key}`}
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
                      data-testid={`goals-${field.key}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label
                  htmlFor="goals-goalType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Goal Type
                </label>

                <select
                  id="goals-goalType"
                  value={formData.goalType}
                  onChange={(e) =>
                    setFormData({ ...formData, goalType: e.target.value as GoalType })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="goals-goalType"
                >
                  <option value={GoalType.Maintain}>Maintain Weight</option>
                  <option value={GoalType.Lose}>Lose Weight</option>
                  <option value={GoalType.Gain}>Gain Weight</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4 items-center justify-between flex-wrap ">
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    data-testid="goals-submit"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Goals'}
                  </Button>

                  {currentGoals && (
                    <Button
                      type="button"
                      onClick={() => {
                        // Delete functionality removed for simplified approach
                        alert('Delete functionality not implemented in simplified version');
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Delete Goals
                    </Button>
                  )}
                </div>

                <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Back to Dashboard
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </div>
    </div>
  );
}
