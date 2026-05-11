import { apiClient } from '@/Services/apiClient';
import type { VendedorOption } from '@/Types/admin';

export async function fetchVendedores() {
  const response = await apiClient.get('/vendedores');
  return (response.data.datos ?? response.data.data ?? []) as VendedorOption[];
}
