'use client';
import { FC } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

interface DashboardClientProps {
  userName: string;
}

const navigationButtons = [
  {
    href: '/',
    label: 'Dashboard',
  },
  {
    href: '/goals',
    label: 'Goals',
  },
  {
    href: '/history',
    label: 'History',
  },
];

export const DashboardClient: FC<DashboardClientProps> = ({ userName = '' }) => {
  const pathname = usePathname() || '';

  return (
    <Card
      className="mb-4 flex flex-row justify-between items-center"
      data-testid="dashboard-header"
    >
      <div>
        <CardTitle className="text-xl font-bold text-gray-900" data-testid="dashboard-welcome">
          Welcome back, {userName}!
        </CardTitle>

        <CardDescription className="mt-1">
          Track your nutrition and reach your goals
        </CardDescription>
      </div>

      <div className="flex gap-3 justify-end items-center max-sm:flex-col">
        <div className="flex gap-3 flex-wrap justify-end items-center">
          {navigationButtons.map((button, index) => {
            const isActive = pathname === button.href;

            return (
              <Link key={index} href={button.href}>
                <span
                  className={`${isActive ? 'text-red-950 font-semibold' : 'text-gray-600 font-medium'}  text-sm transition-colors hover:text-gray-800`}
                  data-testid={`nav-${button.label.toLowerCase()}`}
                >
                  {button.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => signOut()}
          data-testid="logout-button"
        >
          Logout
        </Button>
      </div>
    </Card>
  );
};
