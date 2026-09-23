import { Router } from 'express';
import { XpController } from '../controllers/xp.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Pair Programming
router.get('/pair/:projectId', XpController.getPairSessions);
router.post('/pair', XpController.createPairSession);

// TDD Tests
router.get('/tdd/:projectId', XpController.getTddTests);
router.post('/tdd/:id/run', XpController.runTddTest);

// CI Builds
router.get('/ci/:projectId', XpController.getCiBuilds);

export default router;
