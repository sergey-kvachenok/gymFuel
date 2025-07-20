import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import EnvironmentBanner from '../components/EnvironmentBanner';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <EnvironmentBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
