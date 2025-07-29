import MealsList from '../MealsList';
import { ConsumptionItem } from '../../../../../types/api';

type TodaysMealsServerProps = {
  meals?: ConsumptionItem[];
  error?: string | null;
};

export default function TodaysMealsServer({ meals, error }: TodaysMealsServerProps) {
  return <MealsList consumptions={meals || undefined} error={error} />;
}
