import { apiClient } from '@/Services/apiClient';
import type { ProgramacionItem } from '@/Types/admin';

export async function fetchProgramaciones() {
  const response = await apiClient.get('/programaciones');
  return (response.data.data ?? []) as ProgramacionItem[];
}

export async function createProgramacion(payload: Omit<ProgramacionItem, 'id'>) {
  const response = await apiClient.post('/programaciones', payload);
  return response.data;
}

export async function updateProgramacion(id: number, payload: Omit<ProgramacionItem, 'id'>) {
  const response = await apiClient.put(`/programaciones/${id}`, payload);
  return response.data;
}

export async function deleteProgramacion(id: number) {
  const response = await apiClient.delete(`/programaciones/${id}`);
  return response.data;
}
