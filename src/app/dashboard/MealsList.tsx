import { calculateNutrients } from '../../lib/utils';

type Consumption = {
  id: number;
  amount: number;
  createdAt: Date | string;
  product: {
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

type MealsListProps = {
  consumptions?: Consumption[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
};

export default function MealsList({
  consumptions,
  isLoading = false,
  error = null,
  title = "Today's Meals",
}: MealsListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-gray-500">Loading meals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="text-red-500">Error loading meals: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {!consumptions || consumptions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No meals recorded today. Add your first meal above!
        </div>
      ) : (
        <div className="space-y-3">
          {consumptions.map((consumption) => {
            const nutrients = calculateNutrients(consumption);
            return (
              <div
                key={consumption.id}
                className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{consumption.product.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {consumption.amount}g → {nutrients.calories} cal | P: {nutrients.protein}g | F:{' '}
                    {nutrients.fat}g | C: {nutrients.carbs}g
                  </div>
                </div>
                <div className="text-sm text-gray-400 ml-4">
                  {new Date(consumption.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
