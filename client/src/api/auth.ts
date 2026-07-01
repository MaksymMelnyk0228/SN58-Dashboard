import type { AuthPayload, UserPublic } from '@sn58/shared';
import { api } from './client';

export async function loginRequest(email: string, password: string): Promise<AuthPayload> {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
}

export async function registerRequest(
  email: string,
  name: string,
  password: string,
): Promise<AuthPayload> {
  const { data } = await api.post('/auth/register', { email, name, password });
  return data.data;
}

export async function meRequest(): Promise<UserPublic> {
  const { data } = await api.get('/auth/me');
  return data.data;
}
