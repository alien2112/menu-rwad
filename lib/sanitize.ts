/**
 * Input sanitization utilities for security
 * Protects against XSS, SQL injection, and other common attacks
 */

/**
 * Sanitize string input by removing dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .slice(0, 1000); // Limit length to prevent DOS
}

/**
 * Sanitize HTML content (more strict)
 */
export function sanitizeHTML(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .slice(0, 5000);
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any, defaultValue: number = 0): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  return num;
}

/**
 * Sanitize integer input with min/max bounds
 */
export function sanitizeInteger(
  input: any,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
  defaultValue: number = 0
): number {
  const num = parseInt(String(input), 10);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  const email = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return '';
  return email.slice(0, 255);
}

/**
 * Sanitize phone number (allow digits, spaces, +, -, (, ))
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[^\d\s+\-()]/g, '')
    .slice(0, 20);
}

/**
 * Sanitize URL
 */
export function sanitizeURL(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  const url = input.trim();

  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(url)) return '';

  // Only allow http(s) and relative URLs
  if (url.startsWith('/') || /^https?:\/\//i.test(url)) {
    return url.slice(0, 2000);
  }

  return '';
}

/**
 * Sanitize MongoDB ObjectId
 */
export function sanitizeObjectId(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';

  // MongoDB ObjectId is 24 hex characters
  const objectIdRegex = /^[a-f\d]{24}$/i;
  const cleaned = input.trim();

  if (!objectIdRegex.test(cleaned)) return '';
  return cleaned;
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(input: any[]): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0)
    .slice(0, 100); // Limit array size
}

/**
 * Sanitize object by removing null/undefined and applying string sanitization
 */
export function sanitizeObject<T extends Record<string, any>>(
  input: T,
  allowedKeys: string[]
): Partial<T> {
  if (!input || typeof input !== 'object') return {};

  const sanitized: Partial<T> = {};

  for (const key of allowedKeys) {
    if (key in input) {
      const value = input[key];

      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === 'string') {
        sanitized[key as keyof T] = sanitizeString(value) as any;
      } else if (typeof value === 'number') {
        sanitized[key as keyof T] = sanitizeNumber(value) as any;
      } else if (typeof value === 'boolean') {
        sanitized[key as keyof T] = value;
      } else if (Array.isArray(value)) {
        sanitized[key as keyof T] = sanitizeStringArray(value) as any;
      }
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize pagination parameters
 */
export function sanitizePagination(params: {
  page?: string | number;
  limit?: string | number;
  maxLimit?: number;
}) {
  const { page, limit, maxLimit = 100 } = params;

  return {
    page: Math.max(1, sanitizeInteger(page, 1, 1000, 1)),
    limit: Math.max(1, Math.min(sanitizeInteger(limit, 1, maxLimit, 20), maxLimit)),
  };
}

/**
 * Sanitize order/menu item data
 */
export function sanitizeOrderData(data: any) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid order data');
  }

  const sanitized: any = {
    totalAmount: sanitizeNumber(data.totalAmount, 0),
    discountAmount: sanitizeNumber(data.discountAmount, 0),
    source: sanitizeString(data.source) || 'website',
    notes: sanitizeHTML(data.notes),
  };

  // Sanitize customer info
  if (data.customerInfo && typeof data.customerInfo === 'object') {
    sanitized.customerInfo = {
      name: sanitizeString(data.customerInfo.name),
      phone: sanitizePhone(data.customerInfo.phone),
      email: sanitizeEmail(data.customerInfo.email),
      address: sanitizeString(data.customerInfo.address),
    };
  }

  // Sanitize items array
  if (Array.isArray(data.items)) {
    sanitized.items = data.items.map((item: any) => ({
      menuItemId: sanitizeObjectId(item.menuItemId),
      menuItemName: sanitizeString(item.menuItemName),
      quantity: sanitizeInteger(item.quantity, 1, 100, 1),
      unitPrice: sanitizeNumber(item.unitPrice, 0),
      totalPrice: sanitizeNumber(item.totalPrice, 0),
      notes: sanitizeHTML(item.notes),
    })).filter((item: any) => item.menuItemId && item.quantity > 0);
  }

  return sanitized;
}

/**
 * Rate limiting helper - simple in-memory store
 * For production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
