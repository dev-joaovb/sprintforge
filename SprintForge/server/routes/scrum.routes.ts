import { Router } from 'express';
import { ScrumController } from '../controllers/scrum.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Sprints
router.get('/sprints/:projectId', ScrumController.getSprints);
router.post('/sprints', ScrumController.createSprint);
router.patch('/sprints/:id/complete', ScrumController.completeSprint);
router.patch('/sprints/:id', (req, res) => {
  ScrumController.updateSprint(req, res);
});

// Daily Standup Notes
router.get('/daily/:projectId', ScrumController.getDailyNotes);
router.post('/daily', ScrumController.createDailyNote);
router.delete('/daily/:id', ScrumController.deleteDailyNote);

// Planning Poker
router.get('/poker/:projectId', ScrumController.getPlanningPoker);
router.post('/poker/vote', ScrumController.votePoker);
router.post('/poker/reveal', ScrumController.revealPoker);
router.post('/poker/reset', ScrumController.resetPoker);

// Retrospective Cards
router.get('/retro/:projectId', ScrumController.getRetroCards);
router.post('/retro', ScrumController.createRetroCard);
router.delete('/retro/:id', ScrumController.deleteRetroCard);
router.post('/retro/vote', ScrumController.voteRetroCard);

export default router;