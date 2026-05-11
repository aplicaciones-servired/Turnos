import { useEffect, useState, type FormEvent } from 'react';
import type { ProgramacionItem, TurnoItem, VendedorOption } from '@/Types/admin';
import { fetchVendedores } from '@/Services/vendedores.service';
import { createProgramacion, deleteProgramacion, fetchProgramaciones } from '@/Services/programaciones.service';
import { fetchTurnos } from '@/Services/turnos.service';

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
  horasProgramadas: '8',
  aplicaHoraExtra: true,
};

function toNumber(value: string) {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function ProgramacionesPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [programaciones, setProgramaciones] = useState<ProgramacionItem[]>([]);
  const [programacionForm, setProgramacionForm] = useState<ProgramacionForm>(initialProgramacionForm);

  async function loadAll() {
    setError('');

    try {
      const [vendedoresData, turnosData, programacionesData] = await Promise.all([
        fetchVendedores(),
        fetchTurnos(),
        fetchProgramaciones(),
      ]);

      setVendedores(vendedoresData);
      setTurnos(turnosData);
      setProgramaciones(programacionesData);

      setProgramacionForm((current) => {
        if (current.turnoId || !turnosData.length) {
          return current;
        }

        return { ...current, turnoId: String(turnosData[0].id) };
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleCreateProgramacion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!programacionForm.vendedorDocumento.trim() || !programacionForm.turnoId.trim() || !programacionForm.fecha.trim()) {
      setError('Debe elegir vendedor, turno y fecha');
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
      setMessage('Programación creada correctamente');
      setProgramacionForm(initialProgramacionForm);
      await loadAll();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear la programación');
    } finally {
      setLoading(false);
    }
  }

  async function removeProgramacionItem(id: number) {
    try {
      setError('');
      setMessage('');
      await deleteProgramacion(id);
      setMessage('Programación eliminada correctamente');
      await loadAll();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la programación');
    }
  }

  return (
    <main className="page-container">
      <section className="page-header">
        <h1>Programaciones</h1>
        <p>Asigna vendedores a turnos en fechas específicas.</p>
      </section>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && <div className="alert neutral">Cargando datos...</div>}

      <section className="content-grid">
        <form className="panel-card form-card" onSubmit={handleCreateProgramacion}>
          <div className="card-title">
            <h2>Nueva programación</h2>
            <p>Asigna un vendedor a un turno.</p>
          </div>

          <label>
            Vendedor
            <select
              value={programacionForm.vendedorDocumento}
              onChange={(event) =>
                setProgramacionForm((current) => ({
                  ...current,
                  vendedorDocumento: event.target.value,
                }))
              }
            >
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
              <select
                value={programacionForm.turnoId}
                onChange={(event) =>
                  setProgramacionForm((current) => ({
                    ...current,
                    turnoId: event.target.value,
                  }))
                }
              >
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
              <input
                type="date"
                value={programacionForm.fecha}
                onChange={(event) =>
                  setProgramacionForm((current) => ({
                    ...current,
                    fecha: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label>
            Sucursal / código punto
            <input
              value={programacionForm.sucursalesId}
              onChange={(event) =>
                setProgramacionForm((current) => ({
                  ...current,
                  sucursalesId: event.target.value,
                }))
              }
              placeholder="SUC001"
            />
          </label>

          <div className="two-columns">
            <label>
              Semana
              <input
                type="number"
                value={programacionForm.semanaNumero}
                onChange={(event) =>
                  setProgramacionForm((current) => ({
                    ...current,
                    semanaNumero: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Secuencia
              <input
                type="number"
                value={programacionForm.secuencia}
                onChange={(event) =>
                  setProgramacionForm((current) => ({
                    ...current,
                    secuencia: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label>
            Horas programadas
            <input
              type="number"
              step="0.01"
              value={programacionForm.horasProgramadas}
              onChange={(event) =>
                setProgramacionForm((current) => ({
                  ...current,
                  horasProgramadas: event.target.value,
                }))
              }
            />
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={programacionForm.aplicaHoraExtra}
              onChange={(event) =>
                setProgramacionForm((current) => ({
                  ...current,
                  aplicaHoraExtra: event.target.checked,
                }))
              }
            />
            Aplica hora extra
          </label>

          <button className="primary-button" type="submit">
            Crear programación
          </button>
        </form>

        <div className="panel-card list-card">
          <div className="card-title">
            <h2>Programaciones creadas</h2>
            <p>{programaciones.length} programación{programaciones.length !== 1 ? 'es' : ''} activa{programaciones.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="records-list">
            {programaciones.map((programacion) => (
              <article key={programacion.id} className="record-item">
                <div>
                  <strong>{programacion.vendedorDocumento}</strong>
                  <span>
                    Turno #{programacion.turnoId} · {programacion.fecha}
                  </span>
                  <small>Sucursal: {programacion.sucursalesId || '-'}</small>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void removeProgramacionItem(programacion.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
            {!programaciones.length && (
              <p className="empty-state">Aún no hay programaciones creadas.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
