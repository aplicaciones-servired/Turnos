import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { ProgramacionItem, SucursalOption, TurnoItem, VendedorOption } from '@/Types/admin';
import { fetchVendedores } from '@/Services/vendedores.service';
import { createProgramacion, deleteProgramacion, fetchProgramaciones, updateProgramacion } from '@/Services/programaciones.service';
import { fetchSucursales } from '@/Services/sucursales.service';
import { fetchTurnos } from '@/Services/turnos.service';
import { useToast } from '@/Components/ui/toast';
import ProgramacionesCalendar from './ProgramacionesCalendar';

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

export function ProgramacionesModule({ viewMode = 'list' }: { viewMode?: 'list' | 'calendar' }) {
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [programaciones, setProgramaciones] = useState<ProgramacionItem[]>([]);
  const [programacionForm, setProgramacionForm] = useState<ProgramacionForm>(initialProgramacionForm);
  const [editingId, setEditingId] = useState<number | null>(null);
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
      const payload: Omit<ProgramacionItem, 'id'> = {
        vendedorDocumento: programacionForm.vendedorDocumento.trim(),
        turnoId: Number(programacionForm.turnoId),
        fecha: programacionForm.fecha,
        sucursalesId: programacionForm.sucursalesId.trim() || undefined,
        semanaNumero: toNumber(programacionForm.semanaNumero),
        secuencia: toNumber(programacionForm.secuencia),
        horasProgramadas: toNumber(programacionForm.horasProgramadas),
        aplicaHoraExtra: programacionForm.aplicaHoraExtra,
      };

      if (editingId) {
        await updateProgramacion(editingId, payload);
        showToast({ title: 'Programación actualizada correctamente', tone: 'success' });
        setEditingId(null);
      } else {
        await createProgramacion(payload);
        showToast({ title: 'Programación creada correctamente', tone: 'success' });
      }

      setProgramacionForm(initialProgramacionForm);
      await loadAll();
    } catch (createError) {
      showToast({
        title: editingId ? 'No se pudo actualizar la programación' : 'No se pudo crear la programación',
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

  function startEditProgramacion(item: ProgramacionItem) {
    setEditingId(item.id);
    setProgramacionForm({
      vendedorDocumento: item.vendedorDocumento,
      turnoId: String(item.turnoId),
      fecha: item.fecha,
      sucursalesId: item.sucursalesId ?? '',
      semanaNumero: item.semanaNumero ? String(item.semanaNumero) : '',
      secuencia: item.secuencia ? String(item.secuencia) : '',
      horasProgramadas: item.horasProgramadas != null ? String(item.horasProgramadas) : '8.0',
      aplicaHoraExtra: !!item.aplicaHoraExtra,
    });
    setMode('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setProgramacionForm(initialProgramacionForm);
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

  // internal mode allows toggling between list and calendar when no prop is provided
  const [mode, setMode] = useState<'list' | 'calendar'>(viewMode);
  const isCalendarOnly = mode === 'calendar';

  async function handleExportExcel() {
    // Construir tabla HTML del calendario
    const monthLabel = selectedMonth;
    let html = `<table border="1"><caption>Programaciones ${monthLabel} - ${selectedSucursalLabel}</caption>`;
    html += '<thead><tr>';
    weekdays.forEach((w) => { html += `<th>${w}</th>`; });
    html += '</tr></thead><tbody>';

    calendarWeeks.forEach((week) => {
      html += '<tr>';
      week.forEach((date) => {
        if (!date) {
          html += '<td></td>';
          return;
        }
        const key = toDateKey(date);
        const items = programacionesByDate[key] ?? [];
        let cellHtml = `<div><strong>${date.getDate()}</strong></div>`;
        items.forEach((it) => {
          const name = vendedorByDocumento.get(it.vendedorDocumento) || it.vendedorDocumento;
          cellHtml += `<div>T${it.turnoId} ${name}</div>`;
        });
        html += `<td>${cellHtml}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `programaciones_${selectedMonth}_${selectedSucursal || 'todas'}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div style={{ marginBottom: 12 }} className="tabs-bar">
        <button type="button" className={`tab-button ${mode === 'list' ? 'active' : ''}`} onClick={() => setMode('list')}>Listado</button>
        <button type="button" className={`tab-button ${mode === 'calendar' ? 'active' : ''}`} onClick={() => setMode('calendar')}>Calendario</button>
      </div>
      <div className="panel-grid">
      {!isCalendarOnly && (
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="primary-button" type="submit" disabled={loading}>{editingId ? 'Guardar cambios' : 'Crear programación'}</button>
          {editingId && (
            <button type="button" className="ghost-button" onClick={cancelEdit} disabled={loading}>Cancelar</button>
          )}
        </div>
      </form>
      )}

      {!isCalendarOnly && (
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="ghost-button" onClick={() => startEditProgramacion(programacion)} disabled={loading}>Editar</button>
                <button type="button" className="ghost-button" onClick={() => void removeProgramacionItem(programacion.id)} disabled={loading}>Eliminar</button>
              </div>
            </article>
          ))}
          {!programaciones.length && <p className="empty-state">Aún no hay programaciones creadas.</p>}
        </div>
      </div>
      )}

      {isCalendarOnly && (
        <ProgramacionesCalendar
          calendarWeeks={calendarWeeks}
          weekdays={weekdays}
          programacionesByDate={programacionesByDate}
          vendedorByDocumento={vendedorByDocumento}
          turnoById={turnoById}
          sucursales={sucursales}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedSucursal={selectedSucursal}
          setSelectedSucursal={setSelectedSucursal}
          selectedSucursalLabel={selectedSucursalLabel}
          filteredCount={filteredProgramaciones.length}
          loading={loading}
          onExport={() => void handleExportExcel()}
        />
      )}
      </div>
    </>
  );
}
