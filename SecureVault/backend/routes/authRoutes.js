import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  setup2FA,
  confirm2FA,
  verify2FA,
  disable2FA,
  sendWhatsappOtp,
  getMe,
  refreshToken,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const { validationResult } = await import('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.put('/profile', protect, updateProfile);

router.post('/setup-2fa', protect, setup2FA);
router.post('/confirm-2fa', protect, confirm2FA);
router.post('/verify-2fa', verify2FA);
router.post('/disable-2fa', protect, disable2FA);
router.post('/send-whatsapp-otp', sendWhatsappOtp);

export default router;
