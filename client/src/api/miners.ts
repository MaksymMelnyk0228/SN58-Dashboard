import type { Miner, MinerDetails, PaginationMeta } from '@sn58/shared';
import { api } from './client';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface MinerPayload {
  uid: number;
  hotkey: string;
  score: number;
  rank?: number;
  emissions: number;
  status: 'active' | 'inactive' | 'jailed';
}

export async function listMiners(params: ListParams): Promise<Paginated<Miner>> {
  const { data } = await api.get('/miners', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function getMiner(id: string): Promise<MinerDetails> {
  const { data } = await api.get(`/miners/${id}`);
  return data.data;
}

export async function createMiner(payload: MinerPayload): Promise<Miner> {
  const { data } = await api.post('/miners', payload);
  return data.data;
}

export async function updateMiner(id: string, payload: Partial<MinerPayload>): Promise<Miner> {
  const { data } = await api.patch(`/miners/${id}`, payload);
  return data.data;
}

export async function deleteMiner(id: string): Promise<void> {
  await api.delete(`/miners/${id}`);
}
