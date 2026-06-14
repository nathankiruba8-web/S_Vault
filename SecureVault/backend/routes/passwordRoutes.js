import { Router } from 'express';
import { body } from 'express-validator';
import {
  createPassword,
  getPasswords,
  getPassword,
  updatePassword,
  deletePassword,
  generatePasswordEndpoint,
  checkBreach,
} from '../controllers/passwordController.js';
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

router.use(protect);

router.post(
  '/',
  validate([
    body('websiteName').trim().notEmpty().withMessage('Website name is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  createPassword
);

router.get('/', getPasswords);
router.get('/:id', getPassword);
router.put('/:id', updatePassword);
router.delete('/:id', deletePassword);
router.post('/generate', generatePasswordEndpoint);
router.post('/check-breach', checkBreach);

export default router;
