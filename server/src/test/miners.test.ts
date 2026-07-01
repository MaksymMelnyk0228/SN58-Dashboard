import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Miner } from '../models/Miner';
import {
  app,
  authHeader,
  clearDb,
  createTestUser,
  loginAs,
  startMemoryDb,
  stopMemoryDb,
} from './helpers';

const minerPayload = {
  uid: 99,
  hotkey: '5FakeMin099DemoSN58xxxxxxxxxxxxxxxxxxxx099',
  score: 0.812,
  emissions: 0.015,
  status: 'active',
};

describe('Miner API', () => {
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

  it('creates, reads, updates, and deletes a miner', async () => {
    const created = await request(app)
      .post('/api/miners')
      .set(authHeader(token))
      .send(minerPayload);

    expect(created.status).toBe(201);
    expect(created.body.data.uid).toBe(99);
    expect(created.body.data.hotkey).toBe(minerPayload.hotkey);
    const id = created.body.data.id as string;

    const fetched = await request(app).get(`/api/miners/${id}`).set(authHeader(token));
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.score).toBe(0.812);
    expect(fetched.body.data.activityHistory).toEqual([]);

    const updated = await request(app)
      .patch(`/api/miners/${id}`)
      .set(authHeader(token))
      .send({ score: 0.9, status: 'inactive' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.score).toBe(0.9);
    expect(updated.body.data.status).toBe('inactive');

    const removed = await request(app).delete(`/api/miners/${id}`).set(authHeader(token));
    expect(removed.status).toBe(200);
    expect(await Miner.findById(id)).toBeNull();
  });

  it('paginates miners on the server', async () => {
    await Miner.insertMany(
      Array.from({ length: 15 }, (_, index) => ({
        uid: 100 + index,
        hotkey: `5FakeMin${(100 + index).toString().padStart(3, '0')}xxxxxxxxxxxxxxxxxx`,
        score: 0.5,
        rank: index + 1,
        emissions: 0.01,
        status: 'active',
      })),
    );

    const page1 = await request(app)
      .get('/api/miners?page=1&limit=10')
      .set(authHeader(token));
    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
    });

    const page2 = await request(app)
      .get('/api/miners?page=2&limit=10')
      .set(authHeader(token));
    expect(page2.body.data).toHaveLength(5);
    expect(page2.body.pagination.page).toBe(2);
  });

  it('searches by UID and hotkey and filters by status', async () => {
    await Miner.insertMany([
      {
        uid: 42,
        hotkey: '5FakeMinerAlphaDemoSN58xxxxxxxxxxxxxxxx',
        score: 0.9,
        rank: 1,
        emissions: 0.02,
        status: 'active',
      },
      {
        uid: 77,
        hotkey: '5FakeMinerBetaDemoSN58xxxxxxxxxxxxxxxxx',
        score: 0.4,
        rank: 2,
        emissions: 0.01,
        status: 'jailed',
      },
    ]);

    const byUid = await request(app).get('/api/miners?search=42').set(authHeader(token));
    expect(byUid.body.data).toHaveLength(1);
    expect(byUid.body.data[0].uid).toBe(42);

    const byHotkey = await request(app)
      .get('/api/miners?search=Beta')
      .set(authHeader(token));
    expect(byHotkey.body.data).toHaveLength(1);
    expect(byHotkey.body.data[0].uid).toBe(77);

    const jailed = await request(app).get('/api/miners?status=jailed').set(authHeader(token));
    expect(jailed.body.data).toHaveLength(1);
    expect(jailed.body.data[0].status).toBe('jailed');
  });

  it('sorts by a whitelisted field and rejects unsafe sort keys', async () => {
    await Miner.insertMany([
      {
        uid: 1,
        hotkey: '5FakeLowScorexxxxxxxxxxxxxxxxxxxxxxxxxx',
        score: 0.1,
        rank: 2,
        emissions: 0.01,
        status: 'active',
      },
      {
        uid: 2,
        hotkey: '5FakeHighScorexxxxxxxxxxxxxxxxxxxxxxxxx',
        score: 0.9,
        rank: 1,
        emissions: 0.02,
        status: 'active',
      },
    ]);

    const sorted = await request(app)
      .get('/api/miners?sortBy=score&sortOrder=desc')
      .set(authHeader(token));
    expect(sorted.body.data[0].score).toBe(0.9);

    const invalid = await request(app)
      .get('/api/miners?sortBy=passwordHash')
      .set(authHeader(token));
    expect(invalid.status).toBe(422);
  });

  it('rejects invalid miner payloads', async () => {
    const response = await request(app)
      .post('/api/miners')
      .set(authHeader(token))
      .send({
        uid: -1,
        hotkey: 'not-a-hotkey',
        score: 4,
        emissions: -2,
        status: 'online',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 when UID or hotkey already exists', async () => {
    await request(app).post('/api/miners').set(authHeader(token)).send(minerPayload);
    const duplicate = await request(app)
      .post('/api/miners')
      .set(authHeader(token))
      .send(minerPayload);

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('CONFLICT');
  });

  it('returns 404 for a missing miner', async () => {
    const response = await request(app)
      .get('/api/miners/64b0f2c2c2c2c2c2c2c2c2c2')
      .set(authHeader(token));
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
