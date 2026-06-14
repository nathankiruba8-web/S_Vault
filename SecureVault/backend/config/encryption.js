import CryptoJS from 'crypto-js';

const getKey = () => {
  const secret = process.env.AES_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AES_SECRET must be at least 32 characters');
  }
  return CryptoJS.enc.Utf8.parse(secret.slice(0, 32));
};

export const encrypt = (text) => {
  const key = getKey();
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.toString()}`;
};

export const decrypt = (encryptedText) => {
  const key = getKey();
  const [ivHex, cipherText] = encryptedText.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};
