import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}