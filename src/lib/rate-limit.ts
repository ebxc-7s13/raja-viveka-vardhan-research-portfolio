import { NextResponse } from 'next/server';

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// Trust proxy configuration - only trust x-forwarded-for if behind known proxy
const TRUST_PROXY = process.env.TRUSTED_PROXY === 'true';

function getClientIpFromRequest(request: Request): string {
  if (TRUST_PROXY) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIp) {
      return realIp;
    }
  }
  // Fallback: use a hash of user-agent + random for basic identification
  // In production behind proxy, TRUSTED_PROXY should be true
  return 'unknown';
}

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (request: Request) => string;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    keyGenerator = (req: Request) => {
      const ip = getClientIpFromRequest(req);
      return ip;
    },
    message = 'Too many requests. Please try again later.',
  } = options;

  return {
    check: (
      request: Request
    ): { allowed: boolean; remaining: number; resetTime: number } => {
      const key = keyGenerator(request);
      const now = Date.now();
      const resetTime = now + windowMs;

      const entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime });
        return { allowed: true, remaining: maxRequests - 1, resetTime };
      }

      if (entry.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
        };
      }

      entry.count++;
      return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    },
    message,
  };
}

// Pre-configured rate limiters
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests. Please try again in 15 minutes.',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,            // 5 attempts per 15 min
  message: 'Too many login attempts. Please try again in 15 minutes.',
  keyGenerator: (req: Request) => {
    const ip = getClientIpFromRequest(req);
    return `auth:${ip}`;
  },
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,            // 5 messages per hour
  message: 'Too many contact form submissions. Please try again in 1 hour.',
  keyGenerator: (req: Request) => {
    const ip = getClientIpFromRequest(req);
    return `contact:${ip}`;
  },
});

// Helper: apply rate limit and return response if exceeded
export function applyRateLimit(
  request: Request,
  limiter: ReturnType<typeof rateLimit>
): NextResponse | null {
  const { allowed, remaining, resetTime } = limiter.check(request);

  if (!allowed) {
    return NextResponse.json(
      { error: limiter.message },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '0',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        },
      }
    );
  }

  return null; // Allowed - no response needed
}
