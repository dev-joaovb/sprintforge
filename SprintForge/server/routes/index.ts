import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import xpRoutes from './xp.routes';
import scrumRoutes from './scrum.routes';
import chatRoutes from './chat.routes';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SprintForge Agile API',
    database: 'PostgreSQL (Prisma)',
    timestamp: new Date().toISOString(),
  });
});

// Register Domain Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/xp', xpRoutes);
apiRouter.use('/scrum', scrumRoutes);
apiRouter.use('/chat', chatRoutes);

export default apiRouter;
