'use client';
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { GoalType, IFormData, IRecommendations } from '../types';

interface IRecommendationFormProps {
  handleUseRecommendations: () => void;
  formData: IFormData;
  setFormData: (formData: IFormData) => void;
  setShowRecommendations: (showRecommendations: boolean) => void;
  recommendations?: IRecommendations;
  isRecommendationsLoading: boolean;
}

const goalTypeConfig = [
  {
    type: GoalType.Gain,
    label: 'Gain Weight/Muscle',
  },
  {
    type: GoalType.Lose,
    label: 'Lose Weight',
  },
  {
    type: GoalType.Maintain,
    label: 'Maintain Weight',
  },
];

const recommendationFields = [
  {
    key: 'dailyCalories',
    label: 'Calories:',
    unit: '',
  },
  {
    key: 'dailyProtein',
    label: 'Protein:',
    unit: 'g',
  },
  {
    key: 'dailyFat',
    label: 'Fat:',
    unit: 'g',
  },
  {
    key: 'dailyCarbs',
    label: 'Carbs:',
    unit: 'g',
  },
];

export const RecommendationForm: FC<IRecommendationFormProps> = ({
  handleUseRecommendations,
  formData,
  setFormData,
  setShowRecommendations,
  recommendations,
  isRecommendationsLoading,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-3 border">
      <CardTitle className="mb-1 text-start">Get Recommendations</CardTitle>
      <CardDescription className="text-start">
        Get suggested nutrition goals based on your fitness objective
      </CardDescription>

      <CardContent className="flex flex-col gap-3 mt-3">
        <div className="flex gap-3 flex-wrap">
          {goalTypeConfig.map((config) => (
            <Button
              key={config.type}
              onClick={() => {
                setFormData({ ...formData, goalType: config.type });
                setShowRecommendations(true);
              }}
              variant={formData.goalType === config.type ? 'default' : 'outline'}
              size="sm"
            >
              {config.label}
            </Button>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 min-h-[188px]">
          {isRecommendationsLoading && <div>Loading...</div>}

          {recommendations && (
            <>
              <h3 className="font-semibold text-blue-900 mb-2">
                Recommended for {formData.goalType}:
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                {recommendationFields.map((field) => (
                  <div key={field.key}>
                    <span className="text-blue-700 font-medium">{field.label}</span>
                    <div className="text-blue-900">
                      {recommendations[field.key as keyof typeof recommendations]}
                      {field.unit}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-blue-800 text-sm mb-3">{recommendations.description}</p>

              <Button
                onClick={handleUseRecommendations}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Use These Values
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </div>
  );
};
