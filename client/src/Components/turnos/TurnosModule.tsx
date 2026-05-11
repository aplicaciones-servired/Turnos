import type { FormEvent } from 'react';
import type { TurnoItem } from '@/Types/admin';

type TurnoForm = {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  esNocturno: boolean;
};

type TurnosModuleProps = {
  form: TurnoForm;
  onFormChange: (updater: (current: TurnoForm) => TurnoForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  turnos: TurnoItem[];
  onDelete: (id: number) => void;
};

function formatBoolean(value?: boolean) {
  return value ? 'Sí' : 'No';
}

export function TurnosModule({ form, onFormChange, onSubmit, turnos, onDelete }: TurnosModuleProps) {
  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={onSubmit}>
        <div className="card-title">
          <h2>Nuevo turno</h2>
          <p>Define horarios reutilizables para la programación.</p>
        </div>
        <label>
          Nombre
          <input value={form.nombre} onChange={(event) => onFormChange((current) => ({ ...current, nombre: event.target.value }))} placeholder="Turno 1" />
        </label>
        <div className="two-columns">
          <label>
            Hora inicio
            <input type="time" value={form.horaInicio} onChange={(event) => onFormChange((current) => ({ ...current, horaInicio: event.target.value }))} />
          </label>
          <label>
            Hora fin
            <input type="time" value={form.horaFin} onChange={(event) => onFormChange((current) => ({ ...current, horaFin: event.target.value }))} />
          </label>
        </div>
        <label className="checkbox-line">
          <input type="checkbox" checked={form.esNocturno} onChange={(event) => onFormChange((current) => ({ ...current, esNocturno: event.target.checked }))} />
          Es nocturno
        </label>
        <button className="primary-button" type="submit">Crear turno</button>
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
              <button type="button" className="ghost-button" onClick={() => onDelete(turno.id)}>Eliminar</button>
            </article>
          ))}
          {!turnos.length && <p className="empty-state">Aún no hay turnos creados.</p>}
        </div>
      </div>
    </div>
  );
}
