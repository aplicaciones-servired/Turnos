import { apiClient } from '@/Services/apiClient';
import type { CalculoHorasItem } from '@/Types/admin';

export async function generarCalculoHoras(
  vendedorDocumento: string,
  mes: number,
  anio: number,
  tarifaId?: number
) {
  const response = await apiClient.post('/calculo-horas', {
    vendedorDocumento,
    mes,
    anio,
    ...(tarifaId && { tarifaId }),
  });
  return response.data.data as CalculoHorasItem;
}

export async function obtenerCalculoPeriodo(mes: number, anio: number) {
  const response = await apiClient.get(`/calculo-horas/periodo/${mes}/${anio}`);
  return (response.data.data ?? []) as CalculoHorasItem[];
}

export async function obtenerCalculoVendedor(
  vendedorDocumento: string,
  mes: number,
  anio: number
) {
  const response = await apiClient.get(`/calculo-horas/${vendedorDocumento}/${mes}/${anio}`);
  return response.data.data as CalculoHorasItem;
}

export async function previewCalculoHoras(
  vendedorDocumento: string,
  mes: number,
  anio: number,
  tarifaId?: number
) {
  const params = new URLSearchParams({
    vendedorDocumento,
    mes: String(mes),
    anio: String(anio),
    ...(tarifaId && { tarifaId: String(tarifaId) }),
  });
  const response = await apiClient.get(`/calculo-horas-preview?${params}`);
  return response.data.data;
}

export async function cambiarEstadoCalculo(
  id: number,
  estado: 'borrador' | 'procesado' | 'pagado'
) {
  const response = await apiClient.put(`/calculo-horas/${id}/estado`, { estado });
  return response.data.data as CalculoHorasItem;
}
