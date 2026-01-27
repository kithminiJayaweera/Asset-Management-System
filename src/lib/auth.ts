import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/jwt';

/**
 * Middleware to authenticate requests and extract user info
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}> {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return { authenticated: false, error: 'No authentication token provided' };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  return { authenticated: true, user: payload };
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(allowedRoles: string | string[]) {
  return async (request: NextRequest, user: JWTPayload) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null; // No error, proceed
  };
}

/**
 * Helper to protect API routes
 */
export async function withAuth(
  request: NextRequest,
  allowedRoles?: string | string[]
): Promise<{ user: JWTPayload } | NextResponse> {
  const auth = await authenticateRequest(request);

  if (!auth.authenticated || !auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Authentication required' },
      { status: 401 }
    );
  }

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(auth.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  return { user: auth.user };
}
