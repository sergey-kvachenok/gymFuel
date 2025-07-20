import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import GoalsForm from './GoalsForm';

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center">Please login</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nutrition Goals</h1>
          <p className="text-gray-600">
            Set your daily nutrition targets to reach your fitness goals
          </p>
        </div>

        <GoalsForm />
      </div>
    </div>
  );
}
