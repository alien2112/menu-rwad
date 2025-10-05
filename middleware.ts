import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite root to /menu so the menu renders as the homepage
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/menu';
    const rewrite = NextResponse.rewrite(url);

    // Security headers
    rewrite.headers.set('X-DNS-Prefetch-Control', 'on');
    rewrite.headers.set('X-Frame-Options', 'SAMEORIGIN');
    rewrite.headers.set('X-Content-Type-Options', 'nosniff');
    rewrite.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // Performance headers
    rewrite.headers.set('X-XSS-Protection', '1; mode=block');

    return rewrite;
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Performance headers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Disable caching for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
