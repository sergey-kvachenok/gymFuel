import { getCurrentSession } from '../../lib/auth-utils';
import { DashboardClient } from '../../components/DashboardClient';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  const userName = session?.user?.name || session?.user?.email || '';

  return (
    <div className="px-2">
      <DashboardClient userName={userName} />

      {children}
    </div>
  );
}
