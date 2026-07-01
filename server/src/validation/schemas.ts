import { z } from 'zod';
import {
  ENTITY_STATUSES,
  MINER_SORT_FIELDS,
  SORT_ORDERS,
  VALIDATOR_SORT_FIELDS,
} from '@sn58/shared';

const hotkeySchema = z
  .string()
  .trim()
  .min(8, 'Hotkey must be at least 8 characters')
  .max(64, 'Hotkey must be at most 64 characters')
  .regex(/^5[A-Za-z0-9]+$/, 'Hotkey must be a demo SS58-style value starting with 5');

export const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(2).max(80),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must include a letter')
    .regex(/\d/, 'Password must include a number'),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
});

export const objectIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id'),
});

const paginationBase = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum(ENTITY_STATUSES).optional(),
  sortOrder: z.enum(SORT_ORDERS).default('asc'),
};

export const minerListQuerySchema = z.object({
  ...paginationBase,
  sortBy: z.enum(MINER_SORT_FIELDS).default('rank'),
});

export const validatorListQuerySchema = z.object({
  ...paginationBase,
  sortBy: z.enum(VALIDATOR_SORT_FIELDS).default('rank'),
});

export const createMinerSchema = z.object({
  uid: z.number({ required_error: 'UID is required' }).int().min(0).max(65535),
  hotkey: hotkeySchema,
  score: z.number().min(0).max(1),
  rank: z.number().int().min(1).max(65535).optional(),
  emissions: z.number().min(0).max(1000),
  status: z.enum(ENTITY_STATUSES),
  metadata: z.record(z.unknown()).optional(),
});

export const updateMinerSchema = createMinerSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required' },
);

export const activityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
