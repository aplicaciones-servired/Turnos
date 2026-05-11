import type { FormEvent } from 'react';
import type { ProgramacionItem, TurnoItem, VendedorOption } from '@/Types/admin';

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

type ProgramacionesModuleProps = {
  form: ProgramacionForm;
  onFormChange: (updater: (current: ProgramacionForm) => ProgramacionForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  programaciones: ProgramacionItem[];
  onDelete: (id: number) => void;
  vendedores: VendedorOption[];
  turnos: TurnoItem[];
};

export function ProgramacionesModule({
  form,
  onFormChange,
  onSubmit,
  programaciones,
  onDelete,
  vendedores,
  turnos,
}: ProgramacionesModuleProps) {
  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={onSubmit}>
        <div className="card-title">
          <h2>Nueva programación</h2>
          <p>Asigna un vendedor, turno y fecha para probar la agenda.</p>
        </div>
        <label>
          Vendedor
          <select value={form.vendedorDocumento} onChange={(event) => onFormChange((current) => ({ ...current, vendedorDocumento: event.target.value }))}>
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
            <select value={form.turnoId} onChange={(event) => onFormChange((current) => ({ ...current, turnoId: event.target.value }))}>
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
            <input type="date" value={form.fecha} onChange={(event) => onFormChange((current) => ({ ...current, fecha: event.target.value }))} />
          </label>
        </div>
        <label>
          Sucursal / código punto
          <input value={form.sucursalesId} onChange={(event) => onFormChange((current) => ({ ...current, sucursalesId: event.target.value }))} placeholder="SUC001" />
        </label>
        <div className="two-columns">
          <label>
            Semana
            <input type="number" value={form.semanaNumero} onChange={(event) => onFormChange((current) => ({ ...current, semanaNumero: event.target.value }))} />
          </label>
          <label>
            Secuencia
            <input type="number" value={form.secuencia} onChange={(event) => onFormChange((current) => ({ ...current, secuencia: event.target.value }))} />
          </label>
        </div>
        <label>
          Horas programadas
          <input type="number" step="0.01" value={form.horasProgramadas} onChange={(event) => onFormChange((current) => ({ ...current, horasProgramadas: event.target.value }))} />
        </label>
        <label className="checkbox-line">
          <input type="checkbox" checked={form.aplicaHoraExtra} onChange={(event) => onFormChange((current) => ({ ...current, aplicaHoraExtra: event.target.checked }))} />
          Aplica hora extra
        </label>
        <button className="primary-button" type="submit">Crear programación</button>
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
              <button type="button" className="ghost-button" onClick={() => onDelete(programacion.id)}>Eliminar</button>
            </article>
          ))}
          {!programaciones.length && <p className="empty-state">Aún no hay programaciones creadas.</p>}
        </div>
      </div>
    </div>
  );
}
