export const statsFields = [
  {
    title: 'Calories',
    color: 'text-blue-600',
    unit: '',
    key: 'totalCalories',
    format: (v: number) => Math.round(v),
  },
  {
    title: 'Protein',
    color: 'text-green-600',
    unit: 'g',
    key: 'totalProtein',
    format: (v: number) => v.toFixed(1),
  },
  {
    title: 'Fat',
    color: 'text-yellow-600',
    unit: 'g',
    key: 'totalFat',
    format: (v: number) => v.toFixed(1),
  },
  {
    title: 'Carbs',
    color: 'text-red-600',
    unit: 'g',
    key: 'totalCarbs',
    format: (v: number) => v.toFixed(1),
  },
];
