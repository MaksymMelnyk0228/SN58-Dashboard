import type { DashboardStats, Miner, PaginationMeta } from '@sn58/shared';

export const pagination: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
};

export const miners: Miner[] = [
  {
    id: '64b0f2c2c2c2c2c2c2c2c2c1',
    uid: 42,
    hotkey: '5FakeMinerAlphaDemoSN58xxxxxxxxxxxxxxxx',
    score: 0.872,
    rank: 1,
    emissions: 0.018,
    status: 'active',
    metadata: { simulated: true },
    performanceHistory: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: '64b0f2c2c2c2c2c2c2c2c2c2',
    uid: 77,
    hotkey: '5FakeMinerBetaDemoSN58xxxxxxxxxxxxxxxxx',
    score: 0.41,
    rank: 2,
    emissions: 0.009,
    status: 'jailed',
    metadata: { simulated: true },
    performanceHistory: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
];

export const dashboardStats: DashboardStats = {
  totalValidators: 5,
  activeValidators: 3,
  totalMiners: 30,
  averageMinerScore: 0.642,
  totalEmissions: 0.412,
  currentValidatorRank: 4,
  minerPerformanceHistory: [
    { recordedAt: '2026-01-01T00:00:00.000Z', score: 0.6, emissions: 0.2 },
    { recordedAt: '2026-01-02T00:00:00.000Z', score: 0.65, emissions: 0.22 },
  ],
};
