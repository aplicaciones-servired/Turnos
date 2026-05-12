import { apiClient } from '@/Services/apiClient';
import type { SucursalOption } from '@/Types/admin';

export async function fetchSucursales() {
  const response = await apiClient.get('/sucursales');
  return (response.data.datos ?? response.data.data ?? []) as SucursalOption[];
}