import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { TurnoItem } from '@/Types/admin';
import { createTurno, deleteTurno, fetchTurnos } from '@/Services/turnos.service';
import { useToast } from '@/Components/ui/toast';

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

export function TurnosModule() {
  const [loading, setLoading] = useState(true);
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [turnoForm, setTurnoForm] = useState<TurnoForm>(initialTurnoForm);
  const { showToast } = useToast();

  const loadTurnos = useCallback(async () => {
    try {
      const data = await fetchTurnos();
      setTurnos(data);
    } catch (loadError) {
      showToast({
        title: 'No se pudieron cargar los turnos',
        description: loadError instanceof Error ? loadError.message : 'Error desconocido',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTurnos();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTurnos]);

  async function handleCreateTurno(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!turnoForm.nombre.trim()) {
      showToast({
        title: 'El nombre del turno es obligatorio',
        tone: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      await createTurno(turnoForm);
      showToast({
        title: 'Turno creado correctamente',
        tone: 'success',
      });
      setTurnoForm(initialTurnoForm);
      await loadTurnos();
    } catch (createError) {
      showToast({
        title: 'No se pudo crear el turno',
        description: createError instanceof Error ? createError.message : 'Error desconocido',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeTurnoItem(id: number) {
    try {
      await deleteTurno(id);
      showToast({
        title: 'Turno eliminado correctamente',
        tone: 'success',
      });
      await loadTurnos();
    } catch (deleteError) {
      showToast({
        title: 'No se pudo eliminar el turno',
        description: deleteError instanceof Error ? deleteError.message : 'Error desconocido',
        tone: 'error',
      });
    }
  }

  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={handleCreateTurno}>
        <div className="card-title">
          <h2>Nuevo turno</h2>
          <p>Define horarios reutilizables para la programación.</p>
        </div>
        {loading && <div className="alert neutral">Cargando datos...</div>}
        <label>
          Nombre
          <input value={turnoForm.nombre} onChange={(event) => setTurnoForm((current) => ({ ...current, nombre: event.target.value }))} placeholder="Turno 1" disabled={loading} />
        </label>
        <div className="two-columns">
          <label>
            Hora inicio
            <input type="time" value={turnoForm.horaInicio} onChange={(event) => setTurnoForm((current) => ({ ...current, horaInicio: event.target.value }))} disabled={loading} />
          </label>
          <label>
            Hora fin
            <input type="time" value={turnoForm.horaFin} onChange={(event) => setTurnoForm((current) => ({ ...current, horaFin: event.target.value }))} disabled={loading} />
          </label>
        </div>
        <label className="checkbox-line">
          <input type="checkbox" checked={turnoForm.esNocturno} onChange={(event) => setTurnoForm((current) => ({ ...current, esNocturno: event.target.checked }))} disabled={loading} />
          Es nocturno
        </label>
        <button className="primary-button" type="submit" disabled={loading}>Crear turno</button>
      </form>

      <div className="panel-card list-card">
        <div className="card-title">
          <h2>Turnos creados</h2>
          <p>Lista disponible para pruebas rápidas.</p>
        </div>
        <div className="records-list">
          {turnos.map((turno) => (
            <article key={turno.id} className="record-item">
              <div>
                <strong>{turno.nombre}</strong>
                <span>{turno.horaInicio} - {turno.horaFin}</span>
                <small>Nocturno: {formatBoolean(turno.esNocturno)}</small>
              </div>
              <button type="button" className="ghost-button" onClick={() => void removeTurnoItem(turno.id)} disabled={loading}>Eliminar</button>
            </article>
          ))}
          {!turnos.length && <p className="empty-state">Aún no hay turnos creados.</p>}
        </div>
      </div>
    </div>
  );
}
