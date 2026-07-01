import type { Activity, DashboardStats } from '@sn58/shared';
import { api } from './client';

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard/stats');
  return data.data;
}

export async function getDashboardActivity(limit = 12): Promise<Activity[]> {
  const { data } = await api.get('/dashboard/activity', { params: { limit } });
  return data.data;
}
