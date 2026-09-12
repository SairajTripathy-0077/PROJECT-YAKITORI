import validator from 'validator';

/**
 * Sanitize a plain-text string:
 * - Trim whitespace
 * - Strip HTML tags
 * - Escape HTML entities
 * - Enforce max length
 */
export function sanitizeString(input: unknown, maxLength = 200): string {
  if (typeof input !== 'string') return '';
  let clean = input.trim();
  clean = validator.stripLow(clean, true);       // strip control chars
  clean = validator.escape(clean);                // escape &, <, >, ", '
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  return clean;
}

/**
 * Validate and normalize an email address.
 * Returns normalized email or null if invalid.
 */
export function validateEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  if (!validator.isEmail(trimmed)) return null;
  return validator.normalizeEmail(trimmed) || null;
}

/**
 * Validate a URL (only http/https protocols allowed).
 * Returns sanitized URL or null if invalid.
 */
export function sanitizeUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed === '') return null;
  if (!validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true })) {
    return null;
  }
  return trimmed;
}

/**
 * Validate Firebase provider value.
 */
export function validateProvider(input: unknown): 'google' | 'email' | 'anonymous' {
  if (input === 'google' || input === 'email' || input === 'anonymous') {
    return input;
  }
  return 'email';
}
