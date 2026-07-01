import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { Validator, type ValidatorDocument } from '../models/Validator';
import { serializeValidator } from '../serializers/serializers';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { escapeRegex } from '../utils/escapeRegex';
import { NotFoundError } from '../utils/errors';
import { buildPagination } from '../utils/pagination';

export const listValidators = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, status, sortBy, sortOrder } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };

  const filter: FilterQuery<ValidatorDocument> = {};
  if (status) {
    filter.status = status;
  }
  if (search) {
    const trimmed = search.trim();
    if (/^\d+$/.test(trimmed)) {
      filter.$or = [{ uid: Number(trimmed) }, { hotkey: new RegExp(escapeRegex(trimmed), 'i') }];
    } else {
      filter.hotkey = new RegExp(escapeRegex(trimmed), 'i');
    }
  }

  const [total, docs] = await Promise.all([
    Validator.countDocuments(filter),
    Validator.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  sendSuccess(res, docs.map(serializeValidator), 200, buildPagination(page, limit, total));
});

export const getValidator = asyncHandler(async (req: Request, res: Response) => {
  const doc = await Validator.findById(req.params.id);
  if (!doc) {
    throw new NotFoundError('Validator not found');
  }
  sendSuccess(res, serializeValidator(doc));
});
