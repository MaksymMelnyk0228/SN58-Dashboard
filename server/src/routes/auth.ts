import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authRateLimit } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validation/schemas';

export const authRouter = Router();

authRouter.post('/register', authRateLimit, validate(registerSchema), register);
authRouter.post('/login', authRateLimit, validate(loginSchema), login);
authRouter.get('/me', requireAuth, me);
