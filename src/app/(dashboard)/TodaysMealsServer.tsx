import MealsList from './MealsList';

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

type TodaysMealsServerProps = {
  meals: Consumption[] | null;
  error: string | null;
};

export default function TodaysMealsServer({ meals, error }: TodaysMealsServerProps) {
  return <MealsList consumptions={meals || undefined} error={error} />;
}
