import { apiClient } from '@/Services/apiClient';
import type { TarifaItem } from '@/Types/admin';

export async function fetchTarifas() {
  const response = await apiClient.get('/tarifas');
  return (response.data.data ?? []) as TarifaItem[];
}

export async function createTarifa(payload: Omit<TarifaItem, 'id'>) {
  const response = await apiClient.post('/tarifas', payload);
  return response.data;
}

export async function updateTarifa(id: number, payload: Omit<TarifaItem, 'id'>) {
  const response = await apiClient.put(`/tarifas/${id}`, payload);
  return response.data;
}

export async function deleteTarifa(id: number) {
  const response = await apiClient.delete(`/tarifas/${id}`);
  return response.data;
}
