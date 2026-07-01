import type { Request, Response } from 'express';
import type { PerformancePoint } from '@sn58/shared';
import { Activity } from '../models/Activity';
import { Miner } from '../models/Miner';
import { Validator } from '../models/Validator';
import { serializeActivity } from '../serializers/serializers';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const FEATURED_VALIDATOR_UID = 12;

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalValidators, activeValidators, totalMiners, scoreAgg, emissionAgg, featured] =
    await Promise.all([
      Validator.countDocuments(),
      Validator.countDocuments({ status: 'active' }),
      Miner.countDocuments(),
      Miner.aggregate<{ avg: number }>([{ $group: { _id: null, avg: { $avg: '$score' } } }]),
      Miner.aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: '$emissions' } } }]),
      Validator.findOne({ uid: FEATURED_VALIDATOR_UID }),
    ]);

  const miners = await Miner.find().select('performanceHistory');
  const buckets = new Map<string, { score: number; emissions: number; count: number }>();

  for (const miner of miners) {
    for (const point of miner.performanceHistory) {
      const key = point.recordedAt.toISOString().slice(0, 10);
      const current = buckets.get(key) ?? { score: 0, emissions: 0, count: 0 };
      current.score += point.score;
      current.emissions += point.emissions;
      current.count += 1;
      buckets.set(key, current);
    }
  }

  const minerPerformanceHistory: PerformancePoint[] = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      recordedAt: `${date}T00:00:00.000Z`,
      score: value.count ? Number((value.score / value.count).toFixed(4)) : 0,
      emissions: Number(value.emissions.toFixed(4)),
    }));

  sendSuccess(res, {
    totalValidators,
    activeValidators,
    totalMiners,
    averageMinerScore: Number((scoreAgg[0]?.avg ?? 0).toFixed(4)),
    totalEmissions: Number((emissionAgg[0]?.total ?? 0).toFixed(4)),
    currentValidatorRank: featured?.rank ?? 0,
    minerPerformanceHistory,
  });
});

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query as unknown as { limit: number };
  const docs = await Activity.find().sort({ createdAt: -1 }).limit(limit);
  sendSuccess(res, docs.map(serializeActivity));
});
