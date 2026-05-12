import { apiClient } from '@/Services/apiClient';
import type { NovedadItem } from '@/Types/admin';

export async function fetchNovedades() {
  const response = await apiClient.get('/novedades');
  return (response.data.data ?? response.data.datos ?? []) as NovedadItem[];
}

export async function createNovedad(payload: Omit<NovedadItem, 'id'>) {
  const response = await apiClient.post('/novedades', payload);
  return response.data;
}

export async function updateNovedad(id: number, payload: Omit<NovedadItem, 'id'>) {
  const response = await apiClient.put(`/novedades/${id}`, payload);
  return response.data;
}

export async function deleteNovedad(id: number) {
  const response = await apiClient.delete(`/novedades/${id}`);
  return response.data;
}
