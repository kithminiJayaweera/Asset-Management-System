/**
 * Rate limiting utility for API routes
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function apiRateLimit(
  request: NextRequest,
  options: { limit: number; window: number } = { limit: 100, window: 60000 }
): NextResponse | null {
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const key = identifier;

  if (!store[key]) {
    store[key] = { count: 1, resetTime: now + options.window };
    return null;
  }

  if (now > store[key].resetTime) {
    store[key] = { count: 1, resetTime: now + options.window };
    return null;
  }

  store[key].count++;
  
  if (store[key].count > options.limit) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  return null;
}
