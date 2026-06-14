import crypto from 'crypto';

export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
};

export const hashBackupCode = (code) => {
  return crypto.createHash('sha256').update(code.replace(/-/g, '').toUpperCase()).digest('hex');
};
