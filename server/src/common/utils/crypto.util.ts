/**
 * Cryptographic Utilities
 * Provides secure random number generation and OTP generation
 */

import * as crypto from 'crypto';

/**
 * Generate a secure random OTP code
 * @param length - Length of the OTP code (default: 6)
 * @returns A numeric OTP code as a string
 */
export function generateOtp(length: number = 6): string {
  const max = Math.pow(10, length);
  const randomNumber = crypto.randomInt(0, max);
  return randomNumber.toString().padStart(length, '0');
}

/**
 * Generate a secure random token
 * @param bytes - Number of random bytes to generate (default: 32)
 * @returns A hexadecimal token string
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the random string
 * @param charset - Character set to use (default: alphanumeric)
 * @returns A random string
 */
export function generateRandomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
): string {
  let result = '';
  const charsetLength = charset.length;
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charsetLength];
  }

  return result;
}
