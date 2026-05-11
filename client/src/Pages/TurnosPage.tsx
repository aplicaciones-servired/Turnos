import { useEffect, useState, type FormEvent } from 'react';
import type { TurnoItem } from '@/Types/admin';
import { createTurno, deleteTurno, fetchTurnos } from '@/Services/turnos.service';

type TurnoForm = {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  esNocturno: boolean;
};

const initialTurnoForm: TurnoForm = {
  nombre: '',
  horaInicio: '06:00',
  horaFin: '14:00',
  esNocturno: false,
};

function formatBoolean(value?: boolean) {
  return value ? 'Sí' : 'No';
}

export function TurnosPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [turnoForm, setTurnoForm] = useState<TurnoForm>(initialTurnoForm);

  async function loadTurnos() {
    setError('');
    try {
      const data = await fetchTurnos();
      setTurnos(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los turnos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTurnos();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleCreateTurno(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!turnoForm.nombre.trim()) {
      setError('El nombre del turno es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await createTurno(turnoForm);
      setMessage('Turno creado correctamente');
      setTurnoForm(initialTurnoForm);
      await loadTurnos();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear el turno');
    } finally {
      setLoading(false);
    }
  }

  async function removeTurnoItem(id: number) {
    try {
      setError('');
      setMessage('');
      await deleteTurno(id);
      setMessage('Turno eliminado correctamente');
      await loadTurnos();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el turno');
    }
  }

  return (
    <main className="page-container">
      <section className="page-header">
        <h1>Turnos</h1>
        <p>Define horarios reutilizables para la programación de vendedores.</p>
      </section>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && <div className="alert neutral">Cargando datos...</div>}

      <section className="content-grid">
        <form className="panel-card form-card" onSubmit={handleCreateTurno}>
          <div className="card-title">
            <h2>Nuevo turno</h2>
            <p>Crea un nuevo horario disponible.</p>
          </div>

          <label>
            Nombre
            <input
              value={turnoForm.nombre}
              onChange={(event) =>
                setTurnoForm((current) => ({ ...current, nombre: event.target.value }))
              }
              placeholder="Turno diurno"
            />
          </label>

          <div className="two-columns">
            <label>
              Hora inicio
              <input
                type="time"
                value={turnoForm.horaInicio}
                onChange={(event) =>
                  setTurnoForm((current) => ({ ...current, horaInicio: event.target.value }))
                }
              />
            </label>
            <label>
              Hora fin
              <input
                type="time"
                value={turnoForm.horaFin}
                onChange={(event) =>
                  setTurnoForm((current) => ({ ...current, horaFin: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={turnoForm.esNocturno}
              onChange={(event) =>
                setTurnoForm((current) => ({ ...current, esNocturno: event.target.checked }))
              }
            />
            Es turno nocturno
          </label>

          <button className="primary-button" type="submit">
            Crear turno
          </button>
        </form>

        <div className="panel-card list-card">
          <div className="card-title">
            <h2>Turnos creados</h2>
            <p>{turnos.length} turno{turnos.length !== 1 ? 's' : ''} disponible{turnos.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="records-list">
            {turnos.map((turno) => (
              <article key={turno.id} className="record-item">
                <div>
                  <strong>{turno.nombre}</strong>
                  <span>
                    {turno.horaInicio} - {turno.horaFin}
                  </span>
                  <small>Nocturno: {formatBoolean(turno.esNocturno)}</small>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void removeTurnoItem(turno.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
            {!turnos.length && <p className="empty-state">Aún no hay turnos creados.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
