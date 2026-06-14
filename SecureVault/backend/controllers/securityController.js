import SecurityLog from '../models/SecurityLog.js';
import LoginHistory from '../models/LoginHistory.js';
import Password from '../models/Password.js';
import User from '../models/User.js';

export const getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      logs: logs.map((log) => ({
        id: log._id,
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        date: log.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      history: history.map((h) => ({
        id: h._id,
        date: h.date,
        time: h.createdAt,
        browser: h.browser,
        device: h.device,
        ipAddress: h.ipAddress,
        success: h.success,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSecurityStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const [passwordCount, weakPasswords, recentLogins, securityEvents] = await Promise.all([
      Password.countDocuments({ user: userId }),
      Password.countDocuments({ user: userId, strength: { $lt: 50 } }),
      LoginHistory.countDocuments({ user: userId, success: true, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      SecurityLog.countDocuments({ user: userId, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    let securityScore = 50;
    if (user.twoFactorEnabled) securityScore += 25;
    if (user.whatsapp2FAEnabled) securityScore += 10;
    if (weakPasswords === 0 && passwordCount > 0) securityScore += 15;
    securityScore = Math.min(securityScore, 100);

    res.json({
      success: true,
      stats: {
        passwordCount,
        weakPasswords,
        recentLogins,
        securityEvents,
        twoFactorEnabled: user.twoFactorEnabled,
        whatsapp2FAEnabled: user.whatsapp2FAEnabled,
        securityScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
