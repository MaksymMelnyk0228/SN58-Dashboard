import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    const first = err.issues[0];
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid request data',
      },
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid identifier' },
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message },
    });
    return;
  }

  const mongoError = err as { code?: number; keyPattern?: Record<string, number> };
  if (mongoError.code === 11000) {
    const field = mongoError.keyPattern ? Object.keys(mongoError.keyPattern)[0] : 'field';
    res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: `${field} already exists` },
    });
    return;
  }

  if (!env.isProduction) {
    console.error(err);
  }

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
