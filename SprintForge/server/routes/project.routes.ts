import { Router } from 'express';
import { ProjectController, createProjectSchema, sendInviteSchema, removeMemberSchema } from '../controllers/project.controller';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

router.get('/', ProjectController.listProjects);
router.post('/', validateRequest(createProjectSchema), ProjectController.createProject);
router.get('/invites', ProjectController.listUserInvites);
router.post('/invites/accept', ProjectController.acceptInvite);
router.get('/:id', ProjectController.getProjectById);
router.patch('/:id/status', ProjectController.updateStatus);
router.post('/:id/complete', ProjectController.completeProject);
router.delete('/:id', ProjectController.deleteProject);
router.post('/:id/invites', validateRequest(sendInviteSchema), ProjectController.sendInvite);
router.post('/:id/members/remove', validateRequest(removeMemberSchema), ProjectController.removeMember);
router.post('/:id/leave', ProjectController.leaveProject);

export default router;
