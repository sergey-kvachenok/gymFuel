import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { DashboardClient } from '../../components/DashboardClient';
import NetworkStatus from '../../components/NetworkStatus';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  const userName = session?.user?.name || session?.user?.email || '';
  const userId = session?.user ? parseInt((session.user as { id: string }).id) : 0;

  return (
    <div className="px-2">
      {userId > 0 && (
        <div className="mb-4">
          <NetworkStatus userId={userId} />
        </div>
      )}
      <DashboardClient userName={userName} />

      {children}
    </div>
  );
}
