import { Router } from 'express';
import { getActivity, getStats } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { activityQuerySchema } from '../validation/schemas';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/stats', getStats);
dashboardRouter.get('/activity', validate(activityQuerySchema, 'query'), getActivity);
