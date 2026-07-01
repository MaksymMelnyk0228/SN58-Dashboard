import type { Validator } from '@sn58/shared';
import { api } from './client';
import type { ListParams, Paginated } from './miners';

export async function listValidators(params: ListParams): Promise<Paginated<Validator>> {
  const { data } = await api.get('/validators', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function getValidator(id: string): Promise<Validator> {
  const { data } = await api.get(`/validators/${id}`);
  return data.data;
}
