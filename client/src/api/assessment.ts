import { api } from './client';

export interface CandidateKey {
  key: string;
  createdAt: string;
}

export async function getCandidateKey(): Promise<CandidateKey> {
  const { data } = await api.get('/assessment/key');
  return data.data;
}
