import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import GoalsForm from './GoalsForm';
import { getCurrentUserId } from '../../../lib/auth-utils';

export default async function GoalsPage() {
  let userId = null;

  try {
    userId = await getCurrentUserId();
  } catch (err) {
    console.error('Error getting user ID:', err);
  }

  return (
    <div data-testid="goals-page">
      <Card>
        <CardTitle>Nutrition Goals</CardTitle>
        <CardDescription>
          Set your daily nutrition targets to reach your fitness goals
        </CardDescription>

        <CardContent>
          <GoalsForm userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
