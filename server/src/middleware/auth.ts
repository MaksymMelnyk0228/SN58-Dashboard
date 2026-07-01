import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { AuthError } from '../utils/errors';

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AuthError();
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new AuthError();
    }

    let payload: AuthTokenPayload;
    try {
      payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    } catch {
      throw new AuthError('Invalid or expired token');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AuthError('Invalid or expired token');
    }

    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (error) {
    next(error);
  }
}
