import { Router } from 'express';
import { getValidator, listValidators } from '../controllers/validatorController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { objectIdParamSchema, validatorListQuerySchema } from '../validation/schemas';

export const validatorRouter = Router();

validatorRouter.use(requireAuth);
validatorRouter.get('/', validate(validatorListQuerySchema, 'query'), listValidators);
validatorRouter.get('/:id', validate(objectIdParamSchema, 'params'), getValidator);
