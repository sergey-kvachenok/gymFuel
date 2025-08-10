import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import EnvironmentBanner from '../components/EnvironmentBanner';
import OfflineBanner from '../components/OfflineBanner';

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

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
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col items-center  bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <Providers>
          <OfflineBanner />
          <EnvironmentBanner />
          <main className="max-w-[800px] w-full flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
