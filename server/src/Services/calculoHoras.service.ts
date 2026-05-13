import Programacion from '@/Models/Programacion';
import Turno from '@/Models/Turno';
import Tarifa from '@/Models/Tarifa';
import Novedad from '@/Models/Novedad';
import CalculoHoras from '@/Models/CalculoHoras';
import { Op } from 'sequelize';

interface HorasCalculadas {
  horasNormales: number;
  horasExtraDiurna: number;
  horasExtraNocturna: number;
  horasExtraFestiva: number;
  horasPermiso: number;
  horasIncapacidad: number;
  horasAusencia: number;
}

/**
 * Determina si una fecha es festivo (domingo por ahora)
 * TODO: Integrar con calendario de festivos por ubicación
 */
function esFestivo(fecha: Date): boolean {
  const diaSemana = fecha.getDay();
  return diaSemana === 0; // 0 = domingo
}

/**
 * Calcula la duración en horas entre dos horarios (HH:mm)
 */
function calcularHorasEntreHorarios(
  horaInicio: string,
  horaFin: string
): number {
  const [hiHora, hiMin] = horaInicio.split(':').map(Number);
  const [hfHora, hfMin] = horaFin.split(':').map(Number);

  let minutosInicio = hiHora * 60 + hiMin;
  let minutosFin = hfHora * 60 + hfMin;

  // Si el fin es menor que el inicio, asumimos que cruza medianoche
  if (minutosFin < minutosInicio) {
    minutosFin += 24 * 60;
  }

  const minutosTotales = minutosFin - minutosInicio;
  return minutosTotales / 60;
}

/**
 * Calcula horas trabajadas para un vendedor en un período
 */
export async function calcularHorasVendedor(
  vendedorDocumento: string,
  mes: number,
  anio: number,
  tarifaId?: number
): Promise<HorasCalculadas> {
  // Construir rango en hora local para evitar corrimientos por zona horaria.
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = new Date(anio, mes, 0);

  // Buscar programaciones del vendedor en el período
  const programaciones = await Programacion.findAll({
    where: {
      vendedorDocumento,
      fecha: { [Op.between]: [fechaInicio, fechaFin] },
    },
    include: [{ model: Turno, as: 'turno' }],
  });

  // Buscar novedades del vendedor en el período
  const novedades = await Novedad.findAll({
    where: {
      vendedorDocumento,
      fecha: { [Op.between]: [fechaInicio, fechaFin] },
    },
  });

  // Obtener tarifa del vendedor (usar la primera o la específica)
  const tarifa = tarifaId
    ? await Tarifa.findByPk(tarifaId)
    : await Tarifa.findOne({ limit: 1 });

  if (!tarifa) {
    throw new Error('No se encontró tarifa para el cálculo');
  }

  const resultado: HorasCalculadas = {
    horasNormales: 0,
    horasExtraDiurna: 0,
    horasExtraNocturna: 0,
    horasExtraFestiva: 0,
    horasPermiso: 0,
    horasIncapacidad: 0,
    horasAusencia: 0,
  };

  // Procesar programaciones
  for (const prog of programaciones) {
    const turno = prog.get('turno') as any;
    if (!turno) continue;

    const horasTurno = calcularHorasEntreHorarios(turno.horaInicio, turno.horaFin);
    const fecha = new Date(prog.fecha);
    const festivo = esFestivo(fecha);

    if (festivo) {
      // Horas extra festivas
      resultado.horasExtraFestiva += horasTurno;
    } else if (turno.esNocturno) {
      // Horas extra nocturnas
      resultado.horasExtraNocturna += horasTurno;
    } else {
      // Horas normales / diurnas
      resultado.horasNormales += horasTurno;
    }
  }

  // Procesar novedades (horas que se descontan del trabajador)
  for (const novedad of novedades) {
    if (novedad.tipo === 'permiso') {
      resultado.horasPermiso += novedad.horas;
    } else if (novedad.tipo === 'incapacidad') {
      resultado.horasIncapacidad += novedad.horas;
    } else if (novedad.tipo === 'ausencia') {
      resultado.horasAusencia += novedad.horas;
    }
  }

  return resultado;
}

/**
 * Genera un cálculo de nómina completo para un vendedor en un período
 */
export async function generarCalculoNomina(
  vendedorDocumento: string,
  mes: number,
  anio: number,
  tarifaId?: number
): Promise<CalculoHoras> {
  const horasCalculadas = await calcularHorasVendedor(
    vendedorDocumento,
    mes,
    anio,
    tarifaId
  );

  const tarifa = tarifaId
    ? await Tarifa.findByPk(tarifaId)
    : await Tarifa.findOne({ limit: 1 });

  if (!tarifa) {
    throw new Error('No se encontró tarifa para el cálculo');
  }

  // Calcular valores monetarios
  const valorHorasNormales = horasCalculadas.horasNormales * (tarifa.valorHoraNormal ?? 0);
  const valorHorasExtraDiurna =
    horasCalculadas.horasExtraDiurna * (tarifa.valorHoraExtraDiurna ?? 0);
  const valorHorasExtraNocturna =
    horasCalculadas.horasExtraNocturna * (tarifa.valorHoraExtraNocturna ?? 0);
  const valorHorasExtraFestiva =
    horasCalculadas.horasExtraFestiva * (tarifa.valorHoraExtraFestiva ?? 0);

  // Calcular recargos (valor adicional sobre horas)
  const recargosDiurnos =
    (horasCalculadas.horasNormales * (tarifa.valorHoraNormal ?? 0) * (tarifa.recargoDiurnoPct ?? 0)) /
    100;
  const recargosNocturnos =
    (horasCalculadas.horasExtraNocturna *
      (tarifa.valorHoraExtraNocturna ?? 0) *
      (tarifa.recargoNocturnoPct ?? 0)) /
    100;

  const totalCalculado =
    valorHorasNormales +
    valorHorasExtraDiurna +
    valorHorasExtraNocturna +
    valorHorasExtraFestiva +
    recargosDiurnos +
    recargosNocturnos;

  // Guardar o actualizar el cálculo
  const [calculo] = await CalculoHoras.findOrCreate({
    where: { vendedorDocumento, mes, anio },
    defaults: {
      vendedorDocumento,
      mes,
      anio,
      horasTrabajadasNormales: horasCalculadas.horasNormales,
      horasExtraDiurna: horasCalculadas.horasExtraDiurna,
      horasExtraNocturna: horasCalculadas.horasExtraNocturna,
      horasExtraFestiva: horasCalculadas.horasExtraFestiva,
      horasPermiso: horasCalculadas.horasPermiso,
      horasIncapacidad: horasCalculadas.horasIncapacidad,
      horasAusencia: horasCalculadas.horasAusencia,
      valorHorasNormales,
      valorHorasExtraDiurna,
      valorHorasExtraNocturna,
      valorHorasExtraFestiva,
      recargosDiurnos,
      recargosNocturnos,
      totalCalculado,
      estado: 'borrador',
    },
  });

  // Si existe, actualizar
  if (calculo && !calculo.isNewRecord) {
    await calculo.update({
      horasTrabajadasNormales: horasCalculadas.horasNormales,
      horasExtraDiurna: horasCalculadas.horasExtraDiurna,
      horasExtraNocturna: horasCalculadas.horasExtraNocturna,
      horasExtraFestiva: horasCalculadas.horasExtraFestiva,
      horasPermiso: horasCalculadas.horasPermiso,
      horasIncapacidad: horasCalculadas.horasIncapacidad,
      horasAusencia: horasCalculadas.horasAusencia,
      valorHorasNormales,
      valorHorasExtraDiurna,
      valorHorasExtraNocturna,
      valorHorasExtraFestiva,
      recargosDiurnos,
      recargosNocturnos,
      totalCalculado,
    });
  }

  return calculo;
}

/**
 * Obtiene todos los cálculos de un período
 */
export async function obtenerCalculosPeriodo(
  mes: number,
  anio: number
): Promise<CalculoHoras[]> {
  return CalculoHoras.findAll({
    where: { mes, anio },
    order: [['vendedorDocumento', 'ASC']],
  });
}
