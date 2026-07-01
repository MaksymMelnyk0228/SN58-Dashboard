import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { loginRequest } from './auth';
import { api } from './client';

const server = setupServer(
  http.post('http://localhost:4000/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'admin@example.com' && body.password === 'ChangeMe123!') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: 'u1',
            email: body.email,
            name: 'Local Admin',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        },
      });
    }
    return HttpResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      },
      { status: 401 },
    );
  }),
);

describe('frontend/API login contract', () => {
  beforeAll(() => {
    api.defaults.baseURL = 'http://localhost:4000/api';
    server.listen({ onUnhandledRequest: 'error' });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('unwraps the success envelope from POST /api/auth/login', async () => {
    const result = await loginRequest('admin@example.com', 'ChangeMe123!');
    expect(result.token).toBe('test-token');
    expect(result.user.email).toBe('admin@example.com');
  });

  it('surfaces API error messages from a failed login', async () => {
    await expect(loginRequest('admin@example.com', 'nope')).rejects.toThrow();
  });
});
