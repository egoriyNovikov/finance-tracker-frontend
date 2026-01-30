import { http } from './http';
import type { Asset } from '@/types/asset';

export const assetsApi = {
  getAll() {
    return http.get<Asset[]>('/assets');
  },

  getById(id: number) {
    return http.get<Asset>(`/assets/${id}`);
  },

  create(payload: Partial<Asset>) {
    return http.post<Asset>('/assets', payload);
  },

  update(id: number, payload: Partial<Asset>) {
    return http.put<Asset>(`/assets/${id}`, payload);
  },

  delete(id: number) {
    return http.delete(`/assets/${id}`);
  },
};
