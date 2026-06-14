import crypto from 'crypto';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export const generatePassword = (options = {}) => {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options;

  let charset = '';
  if (uppercase) charset += UPPER;
  if (lowercase) charset += LOWER;
  if (numbers) charset += NUMBERS;
  if (symbols) charset += SYMBOLS;

  if (!charset) charset = LOWER + NUMBERS;

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  return password;
};

export const calculateStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  return Math.min(score, 100);
};
