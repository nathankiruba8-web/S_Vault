export const calculateSecurityScore = (stats) => {
  if (!stats) return 0;
  let score = 40;
  if (stats.twoFactorEnabled) score += 30;
  if (stats.whatsapp2FAEnabled) score += 10;
  if (stats.weakPasswords === 0 && stats.passwordCount > 0) score += 20;
  return Math.min(score, 100);
};

export const getStrengthColor = (strength) => {
  if (strength >= 80) return 'text-green-400';
  if (strength >= 60) return 'text-yellow-400';
  if (strength >= 40) return 'text-orange-400';
  return 'text-red-400';
};

export const getStrengthLabel = (strength) => {
  if (strength >= 80) return 'Strong';
  if (strength >= 60) return 'Good';
  if (strength >= 40) return 'Fair';
  return 'Weak';
};

export const getStrengthBarColor = (strength) => {
  if (strength >= 80) return 'bg-green-500';
  if (strength >= 60) return 'bg-yellow-500';
  if (strength >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};
