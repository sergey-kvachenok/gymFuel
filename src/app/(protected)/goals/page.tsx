import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import GoalsForm from './GoalsForm';

export default async function GoalsPage() {
  return (
    <Card>
      <CardTitle>Nutrition Goals</CardTitle>
      <CardDescription>
        Set your daily nutrition targets to reach your fitness goals
      </CardDescription>

      <CardContent>
        <GoalsForm />
      </CardContent>
    </Card>
  );
}
