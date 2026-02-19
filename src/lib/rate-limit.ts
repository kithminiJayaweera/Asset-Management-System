/**
 * Simple in-memory rate limiting for API routes
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests allowed in the interval
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting middleware
 * Returns a NextResponse if rate limit is exceeded, null otherwise
 */
export function apiRateLimit(
  request: NextRequest,
  config: RateLimitConfig = { interval: 60000, maxRequests: 100 }
): NextResponse | null {
  // Use IP address as identifier
  const identifier = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
  
  const now = Date.now();
  const data = requestCounts.get(identifier);

  if (!data || now > data.resetTime) {
    // New window
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });
    return null; // Allow request
  }

  if (data.count >= config.maxRequests) {
    // Rate limit exceeded
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        limit: config.maxRequests,
        remaining: 0,
        reset: data.resetTime,
      },
      { status: 429 }
    );
  }

  // Increment count
  data.count++;
  requestCounts.set(identifier, data);

  return null; // Allow request
}

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute
