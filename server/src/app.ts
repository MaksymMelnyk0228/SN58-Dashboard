import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { assessmentRouter } from './routes/assessment';
import { authRouter } from './routes/auth';
import { dashboardRouter } from './routes/dashboard';
import { minerRouter } from './routes/miners';
import { validatorRouter } from './routes/validators';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'SN58 Validator Dashboard API',
        simulation: true,
        dashboard: env.clientOrigin,
        health: '/api/health',
        message: 'This is the backend API. Open the React dashboard at the dashboard URL.',
      },
    });
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        simulation: true,
        message: 'Local SN58-inspired simulation API',
      },
    });
  });

  app.use('/api/assessment', assessmentRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/validators', validatorRouter);
  app.use('/api/miners', minerRouter);
  app.use('/api/dashboard', dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
