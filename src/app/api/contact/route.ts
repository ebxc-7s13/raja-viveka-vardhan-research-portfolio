import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { validateBody, contactSchema } from '@/lib/validation';
import { contactLimiter, applyRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError, getClientIp } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(request, contactLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  // Validate input
  const validation = await validateBody(request, contactSchema);
  if (!validation.success) {
    return apiError(validation.error);
  }

  const { name, email, subject, message } = validation.data;
  const ip = getClientIp(request);

  // Check message length is reasonable
  if (message.length < 10 || message.length > 5000) {
    return apiError('Invalid message length');
  }

  // Additional spam detection: check for common spam patterns
  const spamPatterns = [
    /\b(viagra|cialis|lottery|winner|congratulations|click here|act now)\b/i,
    /(https?:\/\/[^\s]+){3,}/, // Multiple URLs
  ];

  if (spamPatterns.some((pattern) => pattern.test(message))) {
    // Silently reject spam without alerting the bot
    return apiSuccess({ message: 'Thank you for your message!' });
  }

  const db = getDb();

  try {
    db.prepare(
      `INSERT INTO messages (name, email, subject, message, ip_address)
       VALUES (?, ?, ?, ?, ?)`
    ).run(name, email, subject, message, ip);

    return apiSuccess({ message: 'Message sent successfully!' });
  } catch (error) {
    return apiError('Failed to send message. Please try again.');
  }
}
