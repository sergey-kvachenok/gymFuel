export type HistoryItem = {
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
