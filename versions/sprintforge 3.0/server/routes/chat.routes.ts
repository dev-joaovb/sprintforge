import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/:projectId', ChatController.getMessagesByProject);
router.post('/:projectId', ChatController.sendMessage);

export default router;
