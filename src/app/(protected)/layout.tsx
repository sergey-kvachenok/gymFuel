import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { DashboardClient } from '../../components/DashboardClient';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  const userName = session?.user?.name || session?.user?.email || '';

  return (
    <div className="px-2">
      <DashboardClient userName={userName} />

      {children}
    </div>
  );
}
