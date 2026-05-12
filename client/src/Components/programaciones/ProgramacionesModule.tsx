import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { ProgramacionItem, SucursalOption, TurnoItem, VendedorOption } from '@/Types/admin';
import { fetchVendedores } from '@/Services/vendedores.service';
import { createProgramacion, deleteProgramacion, fetchProgramaciones } from '@/Services/programaciones.service';
import { fetchSucursales } from '@/Services/sucursales.service';
import { fetchTurnos } from '@/Services/turnos.service';
import { useToast } from '@/Components/ui/toast';

type ProgramacionForm = {
  vendedorDocumento: string;
  turnoId: string;
  fecha: string;
  sucursalesId: string;
  semanaNumero: string;
  secuencia: string;
  horasProgramadas: string;
  aplicaHoraExtra: boolean;
};

const initialProgramacionForm: ProgramacionForm = {
  vendedorDocumento: '',
  turnoId: '',
  fecha: '',
  sucursalesId: '',
  semanaNumero: '',
  secuencia: '',
  horasProgramadas: '8.0',
  aplicaHoraExtra: true,
};

function toNumber(value: string) {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function buildMonthGrid(monthValue: string) {
  const [yearText, monthText] = monthValue.split('-');
  const year = Number(yearText);
  const month = Number(monthText);

  if (Number.isNaN(year) || Number.isNaN(month)) {
    return [] as Array<Array<Date | null>>;
  }

  const firstDay = new Date(year, month - 1, 1);
  const lastDayNumber = new Date(year, month, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDayNumber; day += 1) {
    cells.push(new Date(year, month - 1, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ProgramacionesModule() {
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [programaciones, setProgramaciones] = useState<ProgramacionItem[]>([]);
  const [programacionForm, setProgramacionForm] = useState<ProgramacionForm>(initialProgramacionForm);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const { showToast } = useToast();

  const loadAll = useCallback(async () => {
    try {
      const [vendedoresResult, sucursalesResult, turnosResult, programacionesResult] = await Promise.allSettled([
        fetchVendedores(),
        fetchSucursales(),
        fetchTurnos(),
        fetchProgramaciones(),
      ]);

      const vendedoresData = vendedoresResult.status === 'fulfilled' ? vendedoresResult.value : [];
      const sucursalesData = sucursalesResult.status === 'fulfilled' ? sucursalesResult.value : [];
      const turnosData = turnosResult.status === 'fulfilled' ? turnosResult.value : [];
      const programacionesData = programacionesResult.status === 'fulfilled' ? programacionesResult.value : [];

      setVendedores(vendedoresData);
      setSucursales(sucursalesData);
      setTurnos(turnosData);
      setProgramaciones(programacionesData);

      setSelectedSucursal((current) => {
        if (current && sucursalesData.some((sucursal) => sucursal.CODIGO === current)) {
          return current;
        }

        return sucursalesData[0]?.CODIGO ?? '';
      });

      setProgramacionForm((current) => {
        if (current.turnoId || !turnosData.length) {
          return current;
        }

        return { ...current, turnoId: String(turnosData[0].id) };
      });

      const errores = [vendedoresResult, sucursalesResult, turnosResult, programacionesResult]
        .filter((resultado) => resultado.status === 'rejected')
        .map((resultado) =>
          resultado.status === 'rejected'
            ? (resultado.reason instanceof Error ? resultado.reason.message : String(resultado.reason))
            : ''
        )
        .filter(Boolean);

      if (errores.length) {
        showToast({
          title: 'No se pudieron cargar todos los datos',
          description: errores.join(' | '),
          tone: 'error',
        });
      }
    } catch (loadError) {
      showToast({
        title: 'No se pudo cargar la información',
        description: loadError instanceof Error ? loadError.message : 'Error desconocido',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAll]);

  async function handleCreateProgramacion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!programacionForm.vendedorDocumento.trim() || !programacionForm.turnoId.trim() || !programacionForm.fecha.trim()) {
      showToast({
        title: 'Debe elegir vendedor, turno y fecha',
        tone: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      await createProgramacion({
        vendedorDocumento: programacionForm.vendedorDocumento.trim(),
        turnoId: Number(programacionForm.turnoId),
        fecha: programacionForm.fecha,
        sucursalesId: programacionForm.sucursalesId.trim() || undefined,
        semanaNumero: toNumber(programacionForm.semanaNumero),
        secuencia: toNumber(programacionForm.secuencia),
        horasProgramadas: toNumber(programacionForm.horasProgramadas),
        aplicaHoraExtra: programacionForm.aplicaHoraExtra,
      });
      showToast({
        title: 'Programación creada correctamente',
        tone: 'success',
      });
      setProgramacionForm(initialProgramacionForm);
      await loadAll();
    } catch (createError) {
      showToast({
        title: 'No se pudo crear la programación',
        description: createError instanceof Error ? createError.message : 'Error desconocido',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeProgramacionItem(id: number) {
    try {
      await deleteProgramacion(id);
      showToast({
        title: 'Programación eliminada correctamente',
        tone: 'success',
      });
      await loadAll();
    } catch (deleteError) {
      showToast({
        title: 'No se pudo eliminar la programación',
        description: deleteError instanceof Error ? deleteError.message : 'Error desconocido',
        tone: 'error',
      });
    }
  }

  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  const vendedorByDocumento = useMemo(
    () => new Map(vendedores.map((vendedor) => [vendedor.DOCUMENTO, vendedor.NOMBRES || vendedor.DOCUMENTO])),
    [vendedores],
  );

  const turnoById = useMemo(
    () => new Map(turnos.map((turno) => [turno.id, turno.nombre])),
    [turnos],
  );

  const filteredProgramaciones = useMemo(
    () =>
      programaciones.filter((programacion) => {
        const sameMonth = programacion.fecha.startsWith(selectedMonth);
        const sameSucursal = selectedSucursal ? programacion.sucursalesId === selectedSucursal : true;
        return sameMonth && sameSucursal;
      }),
    [programaciones, selectedMonth, selectedSucursal],
  );

  const programacionesByDate = useMemo(() => {
    const grouped: Record<string, ProgramacionItem[]> = {};

    filteredProgramaciones.forEach((programacion) => {
      const key = programacion.fecha;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(programacion);
    });

    Object.values(grouped).forEach((items) => {
      items.sort((a, b) => a.turnoId - b.turnoId);
    });

    return grouped;
  }, [filteredProgramaciones]);

  const calendarWeeks = useMemo(() => buildMonthGrid(selectedMonth), [selectedMonth]);

  const selectedSucursalLabel = useMemo(() => {
    const sucursal = sucursales.find((item) => item.CODIGO === selectedSucursal);
    if (!sucursal) {
      return 'Todas las sucursales';
    }
    return `${sucursal.NOMBRE || sucursal.CODIGO} (${sucursal.CODIGO})`;
  }, [selectedSucursal, sucursales]);

  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={handleCreateProgramacion}>
        <div className="card-title">
          <h2>Nueva programación</h2>
          <p>Asigna un vendedor, turno y fecha para probar la agenda.</p>
        </div>
        {loading && <div className="alert neutral">Cargando datos...</div>}
        <label>
          Vendedor
          <select value={programacionForm.vendedorDocumento} onChange={(event) => setProgramacionForm((current) => ({ ...current, vendedorDocumento: event.target.value }))} disabled={loading}>
            <option value="">Selecciona un vendedor</option>
            {vendedores.map((vendedor) => (
              <option key={vendedor.DOCUMENTO} value={vendedor.DOCUMENTO}>
                {vendedor.NOMBRES || vendedor.DOCUMENTO} - {vendedor.DOCUMENTO}
              </option>
            ))}
          </select>
        </label>
        <div className="two-columns">
          <label>
            Turno
            <select value={programacionForm.turnoId} onChange={(event) => setProgramacionForm((current) => ({ ...current, turnoId: event.target.value }))} disabled={loading}>
              <option value="">Selecciona un turno</option>
              {turnos.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {turno.nombre} ({turno.horaInicio} - {turno.horaFin})
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input type="date" value={programacionForm.fecha} onChange={(event) => setProgramacionForm((current) => ({ ...current, fecha: event.target.value }))} disabled={loading} />
          </label>
        </div>
        <label>
          Sucursal / código punto
          <select value={programacionForm.sucursalesId} onChange={(event) => setProgramacionForm((current) => ({ ...current, sucursalesId: event.target.value }))} disabled={loading}>
            <option value="">Selecciona una sucursal</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.CODIGO} value={sucursal.CODIGO}>
                {sucursal.NOMBRE || sucursal.CODIGO} - {sucursal.CODIGO}
              </option>
            ))}
          </select>
        </label>
        <div className="two-columns">
          <label>
            Semana
            <input type="number" value={programacionForm.semanaNumero} onChange={(event) => setProgramacionForm((current) => ({ ...current, semanaNumero: event.target.value }))} disabled={loading} />
          </label>
          <label>
            Secuencia
            <input type="number" value={programacionForm.secuencia} onChange={(event) => setProgramacionForm((current) => ({ ...current, secuencia: event.target.value }))} disabled={loading} />
          </label>
        </div>
        <label>
          Horas programadas
          <input type="number" step="0.01" value={programacionForm.horasProgramadas} onChange={(event) => setProgramacionForm((current) => ({ ...current, horasProgramadas: event.target.value }))} disabled={loading} />
        </label>
        <label className="checkbox-line">
          <input type="checkbox" checked={programacionForm.aplicaHoraExtra} onChange={(event) => setProgramacionForm((current) => ({ ...current, aplicaHoraExtra: event.target.checked }))} disabled={loading} />
          Aplica hora extra
        </label>
        <button className="primary-button" type="submit" disabled={loading}>Crear programación</button>
      </form>

      <div className="panel-card list-card">
        <div className="card-title">
          <h2>Programaciones creadas</h2>
          <p>Verifica la relación entre vendedor, turno y fecha.</p>
        </div>
        <div className="records-list">
          {programaciones.map((programacion) => (
            <article key={programacion.id} className="record-item">
              <div>
                <strong>{programacion.vendedorDocumento}</strong>
                <span>Turno #{programacion.turnoId} · {programacion.fecha}</span>
                <small>Sucursal: {programacion.sucursalesId || '-'}</small>
              </div>
              <button type="button" className="ghost-button" onClick={() => void removeProgramacionItem(programacion.id)} disabled={loading}>Eliminar</button>
            </article>
          ))}
          {!programaciones.length && <p className="empty-state">Aún no hay programaciones creadas.</p>}
        </div>
      </div>

      <div className="panel-card list-card schedule-card">
        <div className="card-title schedule-title">
          <div>
            <h2>Vista mensual</h2>
            <p>Tablero de programación por día, sucursal y turno.</p>
          </div>
          <div className="schedule-filters">
            <label>
              Mes
              <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} disabled={loading} />
            </label>
            <label>
              Sucursal
              <select value={selectedSucursal} onChange={(event) => setSelectedSucursal(event.target.value)} disabled={loading}>
                <option value="">Todas</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.CODIGO} value={sucursal.CODIGO}>
                    {sucursal.NOMBRE || sucursal.CODIGO}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="schedule-meta">Mostrando: {selectedSucursalLabel} · {filteredProgramaciones.length} asignaciones</p>

        <div className="schedule-grid-wrapper">
          <table className="schedule-grid" aria-label="Calendario de programaciones">
            <thead>
              <tr>
                {weekdays.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarWeeks.map((week, weekIndex) => (
                <tr key={`week-${weekIndex}`}>
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return <td key={`empty-${weekIndex}-${dayIndex}`} className="calendar-empty" />;
                    }

                    const dateKey = toDateKey(date);
                    const items = programacionesByDate[dateKey] ?? [];

                    return (
                      <td key={dateKey} className={dayIndex === 0 ? 'calendar-sunday' : ''}>
                        <div className="calendar-day-number">{date.getDate()}</div>
                        <div className="calendar-items">
                          {items.map((item) => (
                            <div key={item.id} className="calendar-item">
                              <strong>T{item.turnoId}</strong>
                              <span>{vendedorByDocumento.get(item.vendedorDocumento) || item.vendedorDocumento}</span>
                              <small>{turnoById.get(item.turnoId) || `Turno ${item.turnoId}`}</small>
                            </div>
                          ))}
                          {!items.length && <span className="calendar-empty-text">Sin asignación</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
