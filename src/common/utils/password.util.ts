/* eslint-disable no-useless-escape */
import { randomBytes } from 'crypto';

export function generateSecurePassword(length: number = 16): string {
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
    return generateSecurePassword(length);
  }

  return password;
}
