import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { authOptions } from '../lib/auth';
import Providers from './providers';
import EnvironmentBanner from '../components/EnvironmentBanner';
import { getServerSession } from 'next-auth';
import { DashboardClient } from './(dashboard)/DashboardClient';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GymFuel - Nutrition Tracker',
  description: 'Track your nutrition goals and build muscle with custom food tracking',
  keywords: ['nutrition', 'fitness', 'gym', 'muscle building', 'calorie tracking'],
  authors: [{ name: 'GymFuel Team' }],
  openGraph: {
    title: 'GymFuel - Nutrition Tracker',
    description: 'Track your nutrition goals and build muscle',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  const userName = session?.user?.name || session?.user?.email || '';

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Providers>
          <main className="max-w-[800px] w-full px-4">
            <EnvironmentBanner />
            <DashboardClient userName={userName} />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
