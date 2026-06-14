import { Router } from 'express';
import { getSecurityLogs, getLoginHistory, getSecurityStats } from '../controllers/securityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/logs', getSecurityLogs);
router.get('/history', getLoginHistory);
router.get('/stats', getSecurityStats);

export default router;
