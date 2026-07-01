import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Activity } from '../models/Activity';
import { Miner } from '../models/Miner';
import { Validator } from '../models/Validator';
import {
  app,
  authHeader,
  clearDb,
  createTestUser,
  loginAs,
  startMemoryDb,
  stopMemoryDb,
} from './helpers';

describe('Validator and dashboard API', () => {
  let token: string;

  beforeAll(async () => {
    await startMemoryDb();
  });

  afterAll(async () => {
    await stopMemoryDb();
  });

  beforeEach(async () => {
    await clearDb();
    await createTestUser();
    token = await loginAs();
  });

  it('lists validators with pagination and requires authentication', async () => {
    await Validator.insertMany([
      {
        uid: 12,
        hotkey: '5FakeVal012DemoSN58xxxxxxxxxxxxxxxxxxxx012',
        stake: 1250.45,
        emissions: 0.034,
        rank: 4,
        status: 'active',
        lastUpdated: new Date(),
      },
      {
        uid: 3,
        hotkey: '5FakeVal003DemoSN58xxxxxxxxxxxxxxxxxxxx003',
        stake: 2140.8,
        emissions: 0.051,
        rank: 1,
        status: 'inactive',
        lastUpdated: new Date(),
      },
    ]);

    const unauthorized = await request(app).get('/api/validators');
    expect(unauthorized.status).toBe(401);

    const listed = await request(app)
      .get('/api/validators?page=1&limit=1&sortBy=rank&sortOrder=asc')
      .set(authHeader(token));

    expect(listed.status).toBe(200);
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.data[0].uid).toBe(3);
    expect(listed.body.pagination.total).toBe(2);

    const filtered = await request(app)
      .get('/api/validators?status=active')
      .set(authHeader(token));
    expect(filtered.body.data).toHaveLength(1);
    expect(filtered.body.data[0].uid).toBe(12);
  });

  it('returns a single validator by id', async () => {
    const created = await Validator.create({
      uid: 12,
      hotkey: '5FakeVal012DemoSN58xxxxxxxxxxxxxxxxxxxx012',
      stake: 1250.45,
      emissions: 0.034,
      rank: 4,
      status: 'active',
      lastUpdated: new Date(),
    });

    const response = await request(app)
      .get(`/api/validators/${created.id}`)
      .set(authHeader(token));
    expect(response.status).toBe(200);
    expect(response.body.data.hotkey).toContain('5FakeVal');
  });

  it('computes dashboard stats from the database', async () => {
    await Validator.insertMany([
      {
        uid: 12,
        hotkey: '5FakeVal012DemoSN58xxxxxxxxxxxxxxxxxxxx012',
        stake: 100,
        emissions: 0.03,
        rank: 4,
        status: 'active',
        lastUpdated: new Date(),
      },
      {
        uid: 2,
        hotkey: '5FakeVal002DemoSN58xxxxxxxxxxxxxxxxxxxx002',
        stake: 50,
        emissions: 0.01,
        rank: 2,
        status: 'inactive',
        lastUpdated: new Date(),
      },
    ]);

    await Miner.insertMany([
      {
        uid: 41,
        hotkey: '5FakeMin041xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        score: 0.8,
        rank: 1,
        emissions: 0.02,
        status: 'active',
        performanceHistory: [
          { recordedAt: new Date('2026-01-01'), score: 0.7, emissions: 0.01 },
          { recordedAt: new Date('2026-01-02'), score: 0.8, emissions: 0.02 },
        ],
      },
      {
        uid: 42,
        hotkey: '5FakeMin042xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        score: 0.4,
        rank: 2,
        emissions: 0.01,
        status: 'active',
        performanceHistory: [
          { recordedAt: new Date('2026-01-01'), score: 0.3, emissions: 0.01 },
        ],
      },
    ]);

    await Activity.create({
      type: 'system_notice',
      message: 'Simulated activity',
      entityType: 'system',
    });

    const stats = await request(app).get('/api/dashboard/stats').set(authHeader(token));
    expect(stats.status).toBe(200);
    expect(stats.body.data.totalValidators).toBe(2);
    expect(stats.body.data.activeValidators).toBe(1);
    expect(stats.body.data.totalMiners).toBe(2);
    expect(stats.body.data.averageMinerScore).toBe(0.6);
    expect(stats.body.data.totalEmissions).toBe(0.03);
    expect(stats.body.data.currentValidatorRank).toBe(4);
    expect(stats.body.data.minerPerformanceHistory.length).toBeGreaterThan(0);

    const activity = await request(app)
      .get('/api/dashboard/activity?limit=5')
      .set(authHeader(token));
    expect(activity.status).toBe(200);
    expect(activity.body.data[0].message).toContain('Simulated');
  });
});
