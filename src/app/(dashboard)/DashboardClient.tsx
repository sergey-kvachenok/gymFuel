'use client';
import { FC } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DashboardClientProps {
  userName: string;
}

export const DashboardClient: FC<DashboardClientProps> = ({ userName = '' }) => {
  return (
    <div className="space-y-8">
      {/* Header with Navigation */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
            <p className="text-gray-600 mt-1">Track your nutrition and reach your goals</p>
          </div>
          <div className="flex gap-3">
            <Link href="/goals">
              <Button variant="secondary">Set Goals</Button>
            </Link>
            <Link href="/history">
              <Button variant="secondary">View History</Button>
            </Link>
            <Button variant="destructive" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
