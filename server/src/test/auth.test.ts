import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Activity } from '../models/Activity';
import { Miner } from '../models/Miner';
import { User } from '../models/User';
import {
  app,
  authHeader,
  clearDb,
  createTestUser,
  loginAs,
  startMemoryDb,
  stopMemoryDb,
} from './helpers';

describe('Authentication', () => {
  beforeAll(async () => {
    await startMemoryDb();
  });

  afterAll(async () => {
    await stopMemoryDb();
  });

  beforeEach(async () => {
    await clearDb();
  });

  it('registers a user and returns a token without a password hash', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'new@example.com',
      name: 'New User',
      password: 'SecurePass1',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe('new@example.com');
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(response.body.data.user.password).toBeUndefined();

    const stored = await User.findOne({ email: 'new@example.com' }).select('+passwordHash');
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toBe('SecurePass1');
  });

  it('rejects a duplicate email with 409', async () => {
    await createTestUser({ email: 'dup@example.com' });
    const response = await request(app).post('/api/auth/register').send({
      email: 'dup@example.com',
      name: 'Duplicate',
      password: 'SecurePass1',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('logs in with valid credentials and rejects invalid ones', async () => {
    await createTestUser();

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'ChangeMe123!' });
    expect(ok.status).toBe(200);
    expect(ok.body.data.token).toEqual(expect.any(String));

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'WrongPass1' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns the current user for a valid token', async () => {
    await createTestUser();
    const token = await loginAs();
    const response = await request(app).get('/api/auth/me').set(authHeader(token));

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('admin@example.com');
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  it('rejects protected routes without a token', async () => {
    const response = await request(app).get('/api/miners');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects malformed login payloads', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns a consistent 404 payload for unknown routes', async () => {
    const response = await request(app).get('/api/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  it('does not expose stack traces on unexpected errors', async () => {
    await Activity.create({
      type: 'test',
      message: 'ok',
      entityType: 'system',
    });
    const response = await request(app).get('/api/miners/not-a-valid-id');
    expect(response.status).toBe(401);
    expect(JSON.stringify(response.body)).not.toMatch(/at /);
    expect(response.body.error.stack).toBeUndefined();
  });

  it('returns 422 for an authenticated request with an invalid object id', async () => {
    await createTestUser();
    const token = await loginAs();
    const response = await request(app)
      .get('/api/miners/not-a-valid-id')
      .set(authHeader(token));
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(await Miner.countDocuments()).toBe(0);
  });
});
