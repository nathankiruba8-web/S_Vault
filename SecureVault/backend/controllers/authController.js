import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { UAParser } from 'ua-parser-js';
import User from '../models/User.js';
import LoginHistory from '../models/LoginHistory.js';
import SecurityLog from '../models/SecurityLog.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { generateOtp, sendWhatsAppOtp } from '../services/whatsappService.js';
import { generateBackupCodes, hashBackupCode } from '../utils/backupCodes.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const logSecurity = async (userId, action, req, details = '') => {
  await SecurityLog.create({
    user: userId,
    action,
    details,
    ipAddress: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  });
};

const logLoginHistory = async (userId, req, success = true) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  await LoginHistory.create({
    user: userId,
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    device: `${result.os.name || 'Unknown'} - ${result.device.type || 'desktop'}`,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
    success,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone });
    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    sendWelcomeEmail(user).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+twoFactorSecret +backupCodes');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled || user.whatsapp2FAEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, pending2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
        methods: {
          authenticator: user.twoFactorEnabled,
          whatsapp: user.whatsapp2FAEnabled,
        },
        phone: user.whatsapp2FAEnabled ? user.phone?.replace(/(\d{3})\d+(\d{2})/, '$1****$2') : null,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    await logLoginHistory(user._id, req);
    await logSecurity(user._id, 'login', req);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        whatsapp2FAEnabled: user.whatsapp2FAEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { token, otp, backupCode, method } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired, please login again' });
    }

    if (!decoded.pending2FA) {
      return res.status(400).json({ success: false, message: 'Invalid verification session' });
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret +backupCodes +whatsappOtp +whatsappOtpExpiry');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let verified = false;

    if (backupCode) {
      const hashed = hashBackupCode(backupCode);
      const index = user.backupCodes?.findIndex((c) => c === hashed);
      if (index !== -1) {
        user.backupCodes.splice(index, 1);
        verified = true;
      }
    } else if (method === 'whatsapp' && user.whatsapp2FAEnabled) {
      if (user.whatsappOtp === otp && user.whatsappOtpExpiry > new Date()) {
        verified = true;
        user.whatsappOtp = undefined;
        user.whatsappOtpExpiry = undefined;
      }
    } else if (user.twoFactorEnabled && user.twoFactorSecret) {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: otp,
        window: 1,
      });
    }

    if (!verified) {
      await logLoginHistory(user._id, req, false);
      await logSecurity(user._id, 'login_failed', req, '2FA verification failed');
      return res.status(401).json({ success: false, message: 'Invalid verification code' });
    }

    await user.save();
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    await logLoginHistory(user._id, req);
    await logSecurity(user._id, 'login', req, `2FA via ${method || 'authenticator'}`);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        whatsapp2FAEnabled: user.whatsapp2FAEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setup2FA = async (req, res) => {
  try {
    const { method } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (method === 'whatsapp') {
      if (!user.phone) {
        return res.status(400).json({ success: false, message: 'Phone number required for WhatsApp 2FA' });
      }
      user.whatsapp2FAEnabled = true;
      user.twoFactorMethod = user.twoFactorEnabled ? 'both' : 'whatsapp';
      user.twoFactorEnabled = true;
      await user.save();
      await logSecurity(user._id, '2fa_enabled', req, 'WhatsApp 2FA enabled');
      return res.json({ success: true, message: 'WhatsApp 2FA enabled' });
    }

    const secret = speakeasy.generateSecret({
      name: `SecureVault (${user.email})`,
      length: 32,
    });

    user.twoFactorSecret = secret.base32;
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode,
      message: 'Scan QR code with Google Authenticator, then verify',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirm2FA = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret +backupCodes');

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    const backupCodes = generateBackupCodes();
    user.backupCodes = backupCodes.map(hashBackupCode);
    user.twoFactorEnabled = true;
    user.twoFactorMethod = user.whatsapp2FAEnabled ? 'both' : 'authenticator';
    await user.save();

    await logSecurity(user._id, '2fa_enabled', req, 'Authenticator 2FA enabled');

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const { otp, method } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret +password +whatsappOtp +whatsappOtpExpiry');

    if (method === 'whatsapp') {
      user.whatsapp2FAEnabled = false;
      if (!user.twoFactorSecret) {
        user.twoFactorEnabled = false;
        user.twoFactorMethod = 'authenticator';
      } else {
        user.twoFactorMethod = 'authenticator';
      }
    } else {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: otp,
        window: 1,
      });
      if (!verified) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
      user.twoFactorSecret = undefined;
      user.twoFactorEnabled = false;
      user.backupCodes = [];
      if (user.whatsapp2FAEnabled) {
        user.twoFactorEnabled = true;
        user.twoFactorMethod = 'whatsapp';
      }
    }

    await user.save();
    await logSecurity(user._id, '2fa_disabled', req, `${method || 'authenticator'} 2FA disabled`);

    res.json({ success: true, message: '2FA disabled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendWhatsappOtp = async (req, res) => {
  try {
    const { token } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired' });
    }

    const user = await User.findById(decoded.id).select('+whatsappOtp +whatsappOtpExpiry');
    if (!user?.whatsapp2FAEnabled || !user.phone) {
      return res.status(400).json({ success: false, message: 'WhatsApp 2FA not enabled' });
    }

    const otp = generateOtp();
    user.whatsappOtp = otp;
    user.whatsappOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const result = await sendWhatsAppOtp(user.phone, otp);
    if (!result.success) {
      return res.status(500).json({ success: false, message: result.message || 'Failed to send OTP' });
    }

    res.json({ success: true, message: 'OTP sent to WhatsApp' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
      await logSecurity(req.user._id, 'logout', req);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      twoFactorEnabled: req.user.twoFactorEnabled,
      whatsapp2FAEnabled: req.user.whatsapp2FAEnabled,
      twoFactorMethod: req.user.twoFactorMethod,
    },
  });
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh failed' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        twoFactorEnabled: user.twoFactorEnabled,
        whatsapp2FAEnabled: user.whatsapp2FAEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
