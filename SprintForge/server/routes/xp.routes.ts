import { Router } from 'express';
import { XpController } from '../controllers/xp.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Pair Programming
router.get('/pair/:projectId', XpController.getPairSessions);
router.post('/pair', XpController.createPairSession);
router.patch('/pair/:id/complete', XpController.completePairSession);
router.post('/pair/:id/timer/:action', XpController.handlePairTimer);

// TDD Tests
router.post('/tdd', XpController.createTddTest);
router.get('/tdd/:projectId', XpController.getTddTests);
router.patch('/tdd/:id/cycle', XpController.advanceTddCycle);
router.post('/tdd/:id/run', XpController.runTddTest);

// CI Builds
router.get('/ci/:projectId', XpController.getCiBuilds);
router.post('/ci/trigger', XpController.triggerCiBuild);

export default router;
