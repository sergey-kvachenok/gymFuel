export const NUTRITION_DATA = [
  {
    key: 'totalCalories' as const,
    name: 'Cal',
    textColor: 'text-blue-600',
    formatter: (value: number) => Math.round(value).toString(),
  },
  {
    key: 'totalProtein' as const,
    name: 'Protein',
    textColor: 'text-green-600',
    formatter: (value: number) => `${value.toFixed(1)}g`,
  },
  {
    key: 'totalFat' as const,
    name: 'Fat',
    textColor: 'text-yellow-600',
    formatter: (value: number) => `${value.toFixed(1)}g`,
  },
  {
    key: 'totalCarbs' as const,
    name: 'Carbs',
    textColor: 'text-red-600',
    formatter: (value: number) => `${value.toFixed(1)}g`,
  },
] as const;
