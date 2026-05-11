export interface VendedorOption {
  DOCUMENTO: string;
  NOMBRES?: string;
  CCOSTO?: string | null;
}

export interface TurnoItem {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  esNocturno?: boolean;
}

export interface TarifaItem {
  id: number;
  nombre?: string;
  valorHoraNormal: number;
  valorHoraExtraDiurna?: number;
  valorHoraExtraNocturna?: number;
  valorHoraExtraFestiva?: number;
  recargoDiurnoPct?: number;
  recargoNocturnoPct?: number;
  sucursalesId?: string | null;
}

export interface ProgramacionItem {
  id: number;
  vendedorDocumento: string;
  turnoId: number;
  fecha: string;
  sucursalesId?: string | null;
  semanaNumero?: number | null;
  secuencia?: number | null;
  horasProgramadas?: number | null;
  aplicaHoraExtra?: boolean;
}

export interface NovedadItem {
  id: number;
  vendedorDocumento: string;
  fecha: string;
  tipo: 'permiso' | 'incapacidad' | 'ausencia' | 'otro';
  horas: number;
  incidenteNumero?: string | null;
  descripcion?: string | null;
}
