import { apiClient } from '@/Services/apiClient';
import type { TurnoItem } from '@/Types/admin';

export async function fetchTurnos() {
  const response = await apiClient.get('/turnos');
  return (response.data.data ?? []) as TurnoItem[];
}

export async function createTurno(payload: Omit<TurnoItem, 'id'>) {
  const response = await apiClient.post('/turnos', payload);
  return response.data;
}

export async function updateTurno(id: number, payload: Omit<TurnoItem, 'id'>) {
  const response = await apiClient.put(`/turnos/${id}`, payload);
  return response.data;
}

export async function deleteTurno(id: number) {
  const response = await apiClient.delete(`/turnos/${id}`);
  return response.data;
}
