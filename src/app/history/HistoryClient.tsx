'use client';
import { useState } from 'react';
import { trpc } from '../../lib/trpc-client';

type HistoryItem = {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  consumptionsCount: number;
  consumptions: {
    id: number;
    amount: number;
    createdAt: Date;
    product: {
      name: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  }[];
};

type HistoryClientProps = {
  initialHistory: HistoryItem[] | null;
  initialError: string | null;
};

export default function HistoryClient({ initialHistory, initialError }: HistoryClientProps) {
  const [daysFilter, setDaysFilter] = useState(30);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Загружаем данные с сервера для выбранного периода
  const {
    data: history,
    isLoading,
    error,
  } = trpc.consumption.getHistory.useQuery({ days: daysFilter }, { refetchOnWindowFocus: false });

  // Показываем server data пока не загрузились новые данные
  const displayHistory = history || (daysFilter === 30 ? initialHistory : null);
  const displayError = error?.message || initialError;

  if (displayError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <div className="text-red-500">Error: {displayError}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNutrient = (value: number, unit = 'g') => {
    return `${value.toFixed(1)}${unit}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 2 weeks</option>
              <option value={30}>Last month</option>
              <option value={60}>Last 2 months</option>
              <option value={90}>Last 3 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border">
          <div className="text-gray-500">Loading history...</div>
        </div>
      )}

      {/* History List */}
      {displayHistory && displayHistory.length > 0 ? (
        <div className="space-y-4">
          {displayHistory.map((day) => (
            <div key={day.date} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
              {/* Day Summary */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{formatDate(day.date)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {day.consumptionsCount} meal{day.consumptionsCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(day.totalCalories)}
                      </div>
                      <div className="text-xs text-gray-500">Cal</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {formatNutrient(day.totalProtein)}
                      </div>
                      <div className="text-xs text-gray-500">Protein</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {formatNutrient(day.totalFat)}
                      </div>
                      <div className="text-xs text-gray-500">Fat</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {formatNutrient(day.totalCarbs)}
                      </div>
                      <div className="text-xs text-gray-500">Carbs</div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-400">
                    {expandedDay === day.date ? '▼ Hide details' : '▶ Show details'}
                  </span>
                </div>
              </div>

              {/* Expanded Day Details */}
              {expandedDay === day.date && (
                <div className="border-t bg-gray-50 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Meals</h4>
                  <div className="space-y-3">
                    {day.consumptions.map((consumption) => {
                      const ratio = consumption.amount / 100;
                      const calories = Math.round(consumption.product.calories * ratio);
                      const protein = (consumption.product.protein * ratio).toFixed(1);
                      const fat = (consumption.product.fat * ratio).toFixed(1);
                      const carbs = (consumption.product.carbs * ratio).toFixed(1);

                      return (
                        <div
                          key={consumption.id}
                          className="flex justify-between items-start p-3 bg-white rounded-lg"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {consumption.product.name}
                            </h5>
                            <div className="text-sm text-gray-600 mt-1">
                              {consumption.amount}g → {calories} cal | P: {protein}g | F: {fat}g |
                              C: {carbs}g
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
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 border text-center">
          <div className="text-gray-500">No nutrition data found for the selected period.</div>
          <p className="text-sm text-gray-400 mt-2">
            Start tracking your meals to see your history here!
          </p>
        </div>
      )}
    </div>
  );
}
