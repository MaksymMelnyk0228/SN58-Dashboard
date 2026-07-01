import { unlinkSync } from 'node:fs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { env } from '../config/env';
import { getOrCreateCandidateKey } from '../services/candidateKey';
import { app, startMemoryDb, stopMemoryDb } from './helpers';

describe('Candidate assessment key', () => {
  beforeAll(async () => {
    await startMemoryDb();
  });

  afterAll(async () => {
    await stopMemoryDb();
    try {
      unlinkSync(env.candidateKeyPath);
    } catch {
      // ignore missing temp file
    }
  });

  it('issues a unique SN58 key and returns the same key on later requests', async () => {
    const first = await request(app).get('/api/assessment/key');
    expect(first.status).toBe(200);
    expect(first.body.data.key).toMatch(
      /^SN58-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const second = await request(app).get('/api/assessment/key');
    expect(second.body.data.key).toBe(first.body.data.key);
    expect(getOrCreateCandidateKey().key).toBe(first.body.data.key);
  });
});
