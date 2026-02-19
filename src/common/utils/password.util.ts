/* eslint-disable no-useless-escape */

import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static hashSync(password: string): string {
    return bcrypt.hashSync(password, this.SALT_ROUNDS);
  }

  static generateSecurePassword(length: number = 16): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const bytes = randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
      password += chars[bytes[i] % chars.length];
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
      return this.generateSecurePassword(length);
    }

    return password;
  }
}
