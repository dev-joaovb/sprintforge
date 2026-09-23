import { Router } from 'express';
import { ScrumController } from '../controllers/scrum.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Sprints
router.get('/sprints/:projectId', ScrumController.getSprints);
router.post('/sprints', ScrumController.createSprint);

// Daily Standup Notes
router.get('/daily/:projectId', ScrumController.getDailyNotes);
router.post('/daily', ScrumController.createDailyNote);

// Planning Poker
router.get('/poker/:projectId', ScrumController.getPlanningPoker);

// Retro Cards
router.get('/retro/:projectId', ScrumController.getRetroCards);
router.post('/retro', ScrumController.createRetroCard);

export default router;
