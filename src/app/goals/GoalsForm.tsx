'use client';
import { useState, useEffect } from 'react';
import { trpc } from '../../lib/trpc-client';
import Link from 'next/link';

export default function GoalsForm() {
  const [formData, setFormData] = useState({
    dailyCalories: 2200,
    dailyProtein: 110,
    dailyFat: 73,
    dailyCarbs: 275,
    goalType: 'maintain' as 'gain' | 'lose' | 'maintain',
  });

  const [showRecommendations, setShowRecommendations] = useState(false);

  const { data: currentGoals, isLoading } = trpc.goals.get.useQuery();
  const { data: recommendations } = trpc.goals.getRecommendations.useQuery(
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

  // Загружаем текущие цели в форму
  useEffect(() => {
    if (currentGoals) {
      setFormData({
        dailyCalories: currentGoals.dailyCalories,
        dailyProtein: currentGoals.dailyProtein,
        dailyFat: currentGoals.dailyFat,
        dailyCarbs: currentGoals.dailyCarbs,
        goalType: currentGoals.goalType as 'gain' | 'lose' | 'maintain',
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
        goalType: recommendations.goalType,
      });
      setShowRecommendations(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <div className="text-gray-500">Loading current goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommendations Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Get Recommendations</h2>
        <p className="text-gray-600 mb-4">
          Get suggested nutrition goals based on your fitness objective
        </p>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              setFormData({ ...formData, goalType: 'gain' });
              setShowRecommendations(true);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              formData.goalType === 'gain'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gain Weight/Muscle
          </button>
          <button
            onClick={() => {
              setFormData({ ...formData, goalType: 'lose' });
              setShowRecommendations(true);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              formData.goalType === 'lose'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lose Weight
          </button>
          <button
            onClick={() => {
              setFormData({ ...formData, goalType: 'maintain' });
              setShowRecommendations(true);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              formData.goalType === 'maintain'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Maintain Weight
          </button>
        </div>

        {recommendations && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Recommended for {formData.goalType}:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <span className="text-blue-700 font-medium">Calories:</span>
                <div className="text-blue-900">{recommendations.dailyCalories}</div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Protein:</span>
                <div className="text-blue-900">{recommendations.dailyProtein}g</div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Fat:</span>
                <div className="text-blue-900">{recommendations.dailyFat}g</div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Carbs:</span>
                <div className="text-blue-900">{recommendations.dailyCarbs}g</div>
              </div>
            </div>
            <p className="text-blue-800 text-sm mb-3">{recommendations.description}</p>
            <button
              onClick={handleUseRecommendations}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Use These Values
            </button>
          </div>
        )}
      </div>

      {/* Goals Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">
          {currentGoals ? 'Edit Your Goals' : 'Set Your Goals'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Calories</label>
              <input
                type="number"
                value={formData.dailyCalories}
                onChange={(e) =>
                  setFormData({ ...formData, dailyCalories: Number(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="500"
                max="10000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Protein (g)
              </label>
              <input
                type="number"
                value={formData.dailyProtein}
                onChange={(e) => setFormData({ ...formData, dailyProtein: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="500"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Fat (g)</label>
              <input
                type="number"
                value={formData.dailyFat}
                onChange={(e) => setFormData({ ...formData, dailyFat: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="300"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Carbs (g)
              </label>
              <input
                type="number"
                value={formData.dailyCarbs}
                onChange={(e) => setFormData({ ...formData, dailyCarbs: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="1000"
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saveGoalsMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saveGoalsMutation.isPending ? 'Saving...' : 'Save Goals'}
            </button>

            {currentGoals && (
              <button
                type="button"
                onClick={() => deleteGoalsMutation.mutate()}
                disabled={deleteGoalsMutation.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteGoalsMutation.isPending ? 'Deleting...' : 'Delete Goals'}
              </button>
            )}

            <Link
              href="/dashboard"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
