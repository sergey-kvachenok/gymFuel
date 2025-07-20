type DailyStatsProps = {
  stats: {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    consumptionsCount: number;
  } | null;
  error: string | null;
};

export default function DailyStats({ stats, error }: DailyStatsProps) {
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Daily Nutrition</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">Daily Nutrition</h2>
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border">
      <h2 className="text-xl font-bold mb-4">Daily Nutrition</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{Math.round(stats.totalCalories)}</div>
          <div className="text-sm text-gray-600">Calories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalProtein.toFixed(1)}g</div>
          <div className="text-sm text-gray-600">Protein</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.totalFat.toFixed(1)}g</div>
          <div className="text-sm text-gray-600">Fat</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.totalCarbs.toFixed(1)}g</div>
          <div className="text-sm text-gray-600">Carbs</div>
        </div>
      </div>
    </div>
  );
}
