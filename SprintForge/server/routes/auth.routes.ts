import { Router } from 'express';
import { AuthController, registerSchema, loginSchema, resetPasswordSchema } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.me);
router.post('/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.put('/profile', authenticateToken, AuthController.updateProfile);

export default router;
