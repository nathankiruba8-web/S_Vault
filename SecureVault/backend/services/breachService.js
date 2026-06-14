import crypto from 'crypto';

export const checkPasswordBreach = async (password) => {
  try {
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'SecureVault-PasswordManager' },
    });

    if (!response.ok) {
      return { breached: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return { breached: true, count: parseInt(count, 10) };
      }
    }

    return { breached: false, count: 0 };
  } catch (error) {
    console.error('Breach check failed:', error.message);
    return { breached: false, count: 0, error: true };
  }
};
