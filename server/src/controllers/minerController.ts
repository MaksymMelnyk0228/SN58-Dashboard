import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { Activity } from '../models/Activity';
import { Miner, type MinerDocument } from '../models/Miner';
import { serializeMiner, serializeMinerDetails } from '../serializers/serializers';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ConflictError, NotFoundError } from '../utils/errors';
import { escapeRegex } from '../utils/escapeRegex';
import { buildPagination } from '../utils/pagination';

async function nextRank(): Promise<number> {
  const last = await Miner.findOne().sort({ rank: -1 }).select('rank');
  return (last?.rank ?? 0) + 1;
}

export const listMiners = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, status, sortBy, sortOrder } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };

  const filter: FilterQuery<MinerDocument> = {};
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
    Miner.countDocuments(filter),
    Miner.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  sendSuccess(res, docs.map(serializeMiner), 200, buildPagination(page, limit, total));
});

export const getMiner = asyncHandler(async (req: Request, res: Response) => {
  const doc = await Miner.findById(req.params.id);
  if (!doc) {
    throw new NotFoundError('Miner not found');
  }

  const activities = await Activity.find({
    entityType: 'miner',
    entityId: doc._id,
  })
    .sort({ createdAt: -1 })
    .limit(20);

  sendSuccess(res, serializeMinerDetails(doc, activities));
});

export const createMiner = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    uid: number;
    hotkey: string;
    score: number;
    rank?: number;
    emissions: number;
    status: MinerDocument['status'];
    metadata?: Record<string, unknown>;
  };

  const duplicate = await Miner.findOne({
    $or: [{ uid: body.uid }, { hotkey: body.hotkey }],
  });
  if (duplicate) {
    throw new ConflictError(
      duplicate.uid === body.uid ? 'A miner with this UID already exists' : 'A miner with this hotkey already exists',
    );
  }

  const doc = await Miner.create({
    ...body,
    rank: body.rank ?? (await nextRank()),
    metadata: {
      subnet: 58,
      simulated: true,
      ...(body.metadata ?? {}),
    },
    performanceHistory: [],
  });

  sendSuccess(res, serializeMiner(doc), 201);
});

export const updateMiner = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Partial<{
    uid: number;
    hotkey: string;
    score: number;
    rank: number;
    emissions: number;
    status: MinerDocument['status'];
    metadata: Record<string, unknown>;
  }>;

  if (body.uid !== undefined || body.hotkey !== undefined) {
    const duplicate = await Miner.findOne({
      _id: { $ne: req.params.id },
      $or: [
        ...(body.uid !== undefined ? [{ uid: body.uid }] : []),
        ...(body.hotkey !== undefined ? [{ hotkey: body.hotkey }] : []),
      ],
    });
    if (duplicate) {
      throw new ConflictError('Another miner already uses this UID or hotkey');
    }
  }

  const doc = await Miner.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new NotFoundError('Miner not found');
  }

  sendSuccess(res, serializeMiner(doc));
});

export const deleteMiner = asyncHandler(async (req: Request, res: Response) => {
  const doc = await Miner.findByIdAndDelete(req.params.id);
  if (!doc) {
    throw new NotFoundError('Miner not found');
  }
  sendSuccess(res, { id: doc.id });
});
