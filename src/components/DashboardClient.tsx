'use client';
import { FC } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

interface DashboardClientProps {
  userName: string;
}

const navigationButtons = [
  {
    href: '/goals',
    label: 'Set Goals',
    variant: 'secondary' as const,
  },
  {
    href: '/history',
    label: 'View History',
    variant: 'secondary' as const,
  },
  {
    label: 'Logout',
    variant: 'destructive' as const,
    onClick: () => signOut(),
  },
];

export const DashboardClient: FC<DashboardClientProps> = ({ userName = '' }) => {
  return (
    <Card className="mb-4 flex flex-row justify-between items-center">
      <div>
        <CardTitle className="text-xl font-bold text-gray-900">Welcome back, {userName}!</CardTitle>

        <CardDescription className="mt-1">
          Track your nutrition and reach your goals
        </CardDescription>
      </div>

      <div className="flex gap-3 flex-wrap justify-end">
        {navigationButtons.map((button, index) =>
          button.href ? (
            <Link key={index} href={button.href}>
              <Button variant={button.variant} size="sm">
                {button.label}
              </Button>
            </Link>
          ) : (
            <Button key={index} variant={button.variant} size="sm" onClick={button.onClick}>
              {button.label}
            </Button>
          ),
        )}
      </div>
    </Card>
  );
};
