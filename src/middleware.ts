import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16 still uses middleware export name
export function middleware(request: NextRequest) {
  // Add your middleware logic here
  // For example: authentication checks, redirects, etc.
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
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
