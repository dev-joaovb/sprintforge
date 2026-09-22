import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes';
import { errorHandler } from './server/middleware/errorHandler';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Parsing Middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes FIRST
  app.use('/api', apiRouter);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 SprintForge Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 REST API mounted on /api`);
    console.log(`=================================================`);
  });
}

startServer();
