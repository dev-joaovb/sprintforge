import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './server/routes';
import { errorHandler } from './server/middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[HTTP ${req.method}] ${req.url}`);
    }
    next();
  });
}

// Mount REST API routes
app.use('/api', apiRouter);

async function startServer() {
  // Vite dev middleware integration for full-stack SPA
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve Frontend in Production if built
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          next(err);
        }
      });
    });
  }

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 SprintForge Backend running on port ${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
      console.log(`🗄️ Database: PostgreSQL via Prisma ORM`);
      console.log(`=================================================`);
    });
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
