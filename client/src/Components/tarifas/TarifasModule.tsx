import type { FormEvent } from 'react';
import type { TarifaItem } from '@/Types/admin';

type TarifaForm = {
  nombre: string;
  valorHoraNormal: string;
  valorHoraExtraDiurna: string;
  valorHoraExtraNocturna: string;
  valorHoraExtraFestiva: string;
  recargoDiurnoPct: string;
  recargoNocturnoPct: string;
  sucursalesId: string;
};

type TarifasModuleProps = {
  form: TarifaForm;
  onFormChange: (updater: (current: TarifaForm) => TarifaForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  tarifas: TarifaItem[];
  onDelete: (id: number) => void;
};

export function TarifasModule({ form, onFormChange, onSubmit, tarifas, onDelete }: TarifasModuleProps) {
  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={onSubmit}>
        <div className="card-title">
          <h2>Nueva tarifa</h2>
          <p>Define valores para calcular horas y recargos.</p>
        </div>
        <label>
          Nombre
          <input value={form.nombre} onChange={(event) => onFormChange((current) => ({ ...current, nombre: event.target.value }))} placeholder="Tarifa base" />
        </label>
        <div className="two-columns">
          <label>
            Hora normal
            <input type="number" step="0.01" value={form.valorHoraNormal} onChange={(event) => onFormChange((current) => ({ ...current, valorHoraNormal: event.target.value }))} />
          </label>
          <label>
            Hora extra diurna
            <input type="number" step="0.01" value={form.valorHoraExtraDiurna} onChange={(event) => onFormChange((current) => ({ ...current, valorHoraExtraDiurna: event.target.value }))} />
          </label>
        </div>
        <div className="two-columns">
          <label>
            Hora extra nocturna
            <input type="number" step="0.01" value={form.valorHoraExtraNocturna} onChange={(event) => onFormChange((current) => ({ ...current, valorHoraExtraNocturna: event.target.value }))} />
          </label>
          <label>
            Hora extra festiva
            <input type="number" step="0.01" value={form.valorHoraExtraFestiva} onChange={(event) => onFormChange((current) => ({ ...current, valorHoraExtraFestiva: event.target.value }))} />
          </label>
        </div>
        <div className="two-columns">
          <label>
            Recargo diurno %
            <input type="number" step="0.01" value={form.recargoDiurnoPct} onChange={(event) => onFormChange((current) => ({ ...current, recargoDiurnoPct: event.target.value }))} />
          </label>
          <label>
            Recargo nocturno %
            <input type="number" step="0.01" value={form.recargoNocturnoPct} onChange={(event) => onFormChange((current) => ({ ...current, recargoNocturnoPct: event.target.value }))} />
          </label>
        </div>
        <label>
          Sucursal / código punto
          <input value={form.sucursalesId} onChange={(event) => onFormChange((current) => ({ ...current, sucursalesId: event.target.value }))} placeholder="SUC001" />
        </label>
        <button className="primary-button" type="submit">Crear tarifa</button>
      </form>

      <div className="panel-card list-card">
        <div className="card-title">
          <h2>Tarifas creadas</h2>
          <p>Úsalas para probar el cálculo de costos.</p>
        </div>
        <div className="records-list">
          {tarifas.map((tarifa) => (
            <article key={tarifa.id} className="record-item">
              <div>
                <strong>{tarifa.nombre || 'Sin nombre'}</strong>
                <span>Normal: {tarifa.valorHoraNormal}</span>
                <small>Sucursal: {tarifa.sucursalesId || '-'}</small>
              </div>
              <button type="button" className="ghost-button" onClick={() => onDelete(tarifa.id)}>Eliminar</button>
            </article>
          ))}
          {!tarifas.length && <p className="empty-state">Aún no hay tarifas creadas.</p>}
        </div>
      </div>
    </div>
  );
}
