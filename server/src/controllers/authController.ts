import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { serializeUser } from '../serializers/serializers';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthError, ConflictError } from '../utils/errors';

const SALT_ROUNDS = 10;

function signToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId, email }, env.jwtSecret, options);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body as {
    email: string;
    name: string;
    password: string;
  };

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, name, passwordHash });
  const token = signToken(user.id, user.email);

  sendSuccess(res, { token, user: serializeUser(user) }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new AuthError('Invalid email or password');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AuthError('Invalid email or password');
  }

  const token = signToken(user.id, user.email);
  sendSuccess(res, { token, user: serializeUser(user) });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new AuthError('Invalid or expired token');
  }
  sendSuccess(res, serializeUser(user));
});
