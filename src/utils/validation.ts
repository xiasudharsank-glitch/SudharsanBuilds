// ✅ FIX: Shared validation utilities to prevent code duplication

/**
 * Phone number validation regex (E.164 format)
 * - Optional '+' at start
 * - First digit must be 1-9 (not 0)
 * - Total 8-15 digits (including first digit)
 */
export const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

/**
 * Validates phone number format
 * @param phone - Phone number string to validate
 * @returns true if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone || !phone.trim()) return false;

  // Remove all non-digit characters except leading '+'
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  return PHONE_REGEX.test(cleanPhone);
}

/**
 * Email validation regex (RFC 5322 simplified)
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  return EMAIL_REGEX.test(email.trim());
}
