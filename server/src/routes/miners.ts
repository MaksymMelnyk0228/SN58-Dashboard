import { Router } from 'express';
import {
  createMiner,
  deleteMiner,
  getMiner,
  listMiners,
  updateMiner,
} from '../controllers/minerController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createMinerSchema,
  minerListQuerySchema,
  objectIdParamSchema,
  updateMinerSchema,
} from '../validation/schemas';

export const minerRouter = Router();

minerRouter.use(requireAuth);
minerRouter.get('/', validate(minerListQuerySchema, 'query'), listMiners);
minerRouter.post('/', validate(createMinerSchema), createMiner);
minerRouter.get('/:id', validate(objectIdParamSchema, 'params'), getMiner);
minerRouter.patch('/:id', validate(objectIdParamSchema, 'params'), validate(updateMinerSchema), updateMiner);
minerRouter.delete('/:id', validate(objectIdParamSchema, 'params'), deleteMiner);
