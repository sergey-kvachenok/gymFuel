import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Get the current user ID from the server session
 * @returns number | null - The user ID as a number, or null if not authenticated
 */
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const session = await getServerSession(authOptions);

    // Type assertion since we know the session callback adds the id
    const user = session?.user as { id?: string } | undefined;

    if (!user?.id) {
      return null;
    }

    const userId = parseInt(user.id, 10);
    return isNaN(userId) ? null : userId;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Get the current user session with proper typing
 * @returns Session with user ID or null if not authenticated
 */
export async function getCurrentSession() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    // Type assertion since we know the session callback adds the id
    const user = session.user as { id?: string; name?: string; email?: string };

    return {
      ...session,
      user: {
        ...user,
        id: user.id ? parseInt(user.id, 10) : null,
      },
    };
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}
