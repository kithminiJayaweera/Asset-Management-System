import jwt from 'jsonwebtoken';
import { IUser } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'super_admin' | 'admin' | 'employee';
  organizationId: string;
}

/**
 * Generate a JWT token for a user
 */
export function signToken(user: any): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    organizationId: user.organizationId?.toString() || user.organizationId,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(userRole);
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(userRole: string, action: string): boolean {
  const permissions: Record<string, string[]> = {
    super_admin: ['view_assets', 'add_assets', 'edit_assets', 'delete_assets', 'view_requests', 'approve_requests', 'manage_users', 'manage_organizations'],
    admin: ['view_assets', 'add_assets', 'edit_assets', 'delete_assets', 'view_requests', 'manage_users'],
    employee: ['view_assets', 'view_own_assets', 'request_assets'],
  };

  const userPermissions = permissions[userRole] || [];
  return userPermissions.includes(action);
}
