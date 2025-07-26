import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected and public routes
const protectedRoutes = ['/', '/history', '/add-product', '/goals'];
const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore API, _next, static, and public files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // Check for session (JWT)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  // If user is not authenticated and tries to access a protected route
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and tries to access login or register
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = '/';
    return NextResponse.redirect(dashboardUrl);
  }

  // Default: allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all relevant routes
    '/((?!api|_next|public|.*\..*).*)',
  ],
};
