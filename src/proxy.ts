import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('trangtra_session')?.value;

  const isAuthenticated = session === 'logged_in';

  // Allow public access to customer portal without login
  if (pathname.startsWith('/c/')) {
    return NextResponse.next();
  }

  // Allow cron job execution
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next();
  }

  // If trying to access login page while authenticated, redirect to home
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If not authenticated and accessing any other page, redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images with extensions .png, .jpg, .jpeg, .svg, .webp)
     * - api/init-db (optional db init)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/init-db|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
