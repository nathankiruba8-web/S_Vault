import Password from '../models/Password.js';
import SecurityLog from '../models/SecurityLog.js';
import { encrypt, decrypt } from '../config/encryption.js';
import { checkPasswordBreach } from '../services/breachService.js';
import { generatePassword, calculateStrength } from '../utils/passwordGenerator.js';

const logAction = async (userId, action, req, details = '') => {
  await SecurityLog.create({
    user: userId,
    action,
    details,
    ipAddress: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  });
};

export const createPassword = async (req, res) => {
  try {
    const { websiteName, websiteUrl, username, password, notes, category, expiryDate } = req.body;

    const breach = await checkPasswordBreach(password);
    const strength = calculateStrength(password);

    const entry = await Password.create({
      user: req.user._id,
      websiteName,
      websiteUrl,
      username,
      encryptedPassword: encrypt(password),
      notes,
      category: category || 'other',
      expiryDate,
      strength,
    });

    await logAction(req.user._id, 'password_created', req, websiteName);

    res.status(201).json({
      success: true,
      password: {
        id: entry._id,
        websiteName: entry.websiteName,
        websiteUrl: entry.websiteUrl,
        username: entry.username,
        notes: entry.notes,
        category: entry.category,
        expiryDate: entry.expiryDate,
        strength: entry.strength,
        lastAccessed: entry.lastAccessed,
        createdAt: entry.createdAt,
      },
      breachWarning: breach.breached
        ? { breached: true, count: breach.count, message: `This password appears in ${breach.count} known data breaches` }
        : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPasswords = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { user: req.user._id };

    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { websiteName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { websiteUrl: { $regex: search, $options: 'i' } },
      ];
    }

    const passwords = await Password.find(filter).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: passwords.length,
      passwords: passwords.map((p) => ({
        id: p._id,
        websiteName: p.websiteName,
        websiteUrl: p.websiteUrl,
        username: p.username,
        notes: p.notes,
        category: p.category,
        expiryDate: p.expiryDate,
        strength: p.strength,
        lastAccessed: p.lastAccessed,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPassword = async (req, res) => {
  try {
    const entry = await Password.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Password not found' });
    }

    entry.lastAccessed = new Date();
    await entry.save();
    await logAction(req.user._id, 'password_viewed', req, entry.websiteName);

    res.json({
      success: true,
      password: {
        id: entry._id,
        websiteName: entry.websiteName,
        websiteUrl: entry.websiteUrl,
        username: entry.username,
        password: decrypt(entry.encryptedPassword),
        notes: entry.notes,
        category: entry.category,
        expiryDate: entry.expiryDate,
        strength: entry.strength,
        lastAccessed: entry.lastAccessed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const entry = await Password.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Password not found' });
    }

    const { websiteName, websiteUrl, username, password, notes, category, expiryDate } = req.body;

    if (websiteName) entry.websiteName = websiteName;
    if (websiteUrl !== undefined) entry.websiteUrl = websiteUrl;
    if (username) entry.username = username;
    if (notes !== undefined) entry.notes = notes;
    if (category) entry.category = category;
    if (expiryDate !== undefined) entry.expiryDate = expiryDate;

    let breachWarning = null;
    if (password) {
      const breach = await checkPasswordBreach(password);
      entry.encryptedPassword = encrypt(password);
      entry.strength = calculateStrength(password);
      if (breach.breached) {
        breachWarning = {
          breached: true,
          count: breach.count,
          message: `This password appears in ${breach.count} known data breaches`,
        };
      }
    }

    await entry.save();
    await logAction(req.user._id, 'password_updated', req, entry.websiteName);

    res.json({
      success: true,
      password: {
        id: entry._id,
        websiteName: entry.websiteName,
        websiteUrl: entry.websiteUrl,
        username: entry.username,
        notes: entry.notes,
        category: entry.category,
        expiryDate: entry.expiryDate,
        strength: entry.strength,
      },
      breachWarning,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePassword = async (req, res) => {
  try {
    const entry = await Password.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Password not found' });
    }

    await logAction(req.user._id, 'password_deleted', req, entry.websiteName);
    res.json({ success: true, message: 'Password deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePasswordEndpoint = async (req, res) => {
  try {
    const { length, uppercase, lowercase, numbers, symbols } = req.body;
    const password = generatePassword({ length, uppercase, lowercase, numbers, symbols });
    const strength = calculateStrength(password);
    const breach = await checkPasswordBreach(password);

    res.json({
      success: true,
      password,
      strength,
      breachWarning: breach.breached ? { breached: true, count: breach.count } : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkBreach = async (req, res) => {
  try {
    const { password } = req.body;
    const breach = await checkPasswordBreach(password);
    res.json({ success: true, ...breach });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
