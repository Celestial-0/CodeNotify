/**
 * Password Service
 * Handles password hashing and verification using bcrypt
 */

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PASSWORD } from '../../common/constants';

@Injectable()
export class PasswordService {
  /**
   * Hash a plain text password
   * @param plainPassword - The plain text password to hash
   * @returns The hashed password
   */
  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, PASSWORD.SALT_ROUNDS);
  }

  /**
   * Verify a plain text password against a hashed password
   * @param plainPassword - The plain text password to verify
   * @param hashedPassword - The hashed password to compare against
   * @returns True if the password matches, false otherwise
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
