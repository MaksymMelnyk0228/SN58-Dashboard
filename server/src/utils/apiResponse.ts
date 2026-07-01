import type { Response } from 'express';
import type { PaginationMeta } from '@sn58/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  pagination?: PaginationMeta,
): void {
  if (pagination) {
    res.status(status).json({ success: true, data, pagination });
    return;
  }
  res.status(status).json({ success: true, data });
}
