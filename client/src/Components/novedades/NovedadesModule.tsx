import { useState, type FormEvent } from 'react';
import type { NovedadItem, VendedorOption } from '@/Types/admin';

type NovedadForm = {
  vendedorDocumento: string;
  fecha: string;
  tipo: NovedadItem['tipo'];
  horas: string;
  incidenteNumero: string;
  descripcion: string;
};

interface NovedadesModuleProps {
  novedades: NovedadItem[];
  vendedores: VendedorOption[];
  loading?: boolean;
  onCreateNovedad: (form: NovedadForm) => Promise<void>;
  onDeleteNovedad: (id: number) => Promise<void>;
}

const initialNovedadForm: NovedadForm = {
  vendedorDocumento: '',
  fecha: '',
  tipo: 'permiso',
  horas: '0',
  incidenteNumero: '',
  descripcion: '',
};

export function NovedadesModule({
  novedades,
  vendedores,
  loading,
  onCreateNovedad,
  onDeleteNovedad,
}: NovedadesModuleProps) {
  const [novedadForm, setNovedadForm] = useState<NovedadForm>(initialNovedadForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!novedadForm.vendedorDocumento.trim() || !novedadForm.fecha.trim()) {
      return;
    }
    await onCreateNovedad(novedadForm);
    setNovedadForm(initialNovedadForm);
  }

  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={handleSubmit}>
        <div className="card-title">
          <h2>Nueva novedad</h2>
          <p>Registra permisos, incapacidades y ausencias.</p>
        </div>
        <label>
          Vendedor
          <select
            value={novedadForm.vendedorDocumento}
            onChange={(e) => setNovedadForm((c) => ({ ...c, vendedorDocumento: e.target.value }))}
            disabled={loading}
          >
            <option value="">Selecciona un vendedor</option>
            {vendedores.map((v) => (
              <option key={v.DOCUMENTO} value={v.DOCUMENTO}>
                {v.NOMBRES || v.DOCUMENTO} - {v.DOCUMENTO}
              </option>
            ))}
          </select>
        </label>
        <div className="two-columns">
          <label>
            Fecha
            <input
              type="date"
              value={novedadForm.fecha}
              onChange={(e) => setNovedadForm((c) => ({ ...c, fecha: e.target.value }))}
              disabled={loading}
            />
          </label>
          <label>
            Tipo
            <select
              value={novedadForm.tipo}
              onChange={(e) => setNovedadForm((c) => ({ ...c, tipo: e.target.value as NovedadItem['tipo'] }))}
              disabled={loading}
            >
              <option value="permiso">Permiso</option>
              <option value="incapacidad">Incapacidad</option>
              <option value="ausencia">Ausencia</option>
              <option value="otro">Otro</option>
            </select>
          </label>
        </div>
        <label>
          Horas
          <input
            type="number"
            step="0.01"
            value={novedadForm.horas}
            onChange={(e) => setNovedadForm((c) => ({ ...c, horas: e.target.value }))}
            disabled={loading}
          />
        </label>
        <label>
          Incidente / mesa de ayuda
          <input
            value={novedadForm.incidenteNumero}
            onChange={(e) => setNovedadForm((c) => ({ ...c, incidenteNumero: e.target.value }))}
            placeholder="INC-1001"
            disabled={loading}
          />
        </label>
        <label>
          Descripción
          <textarea
            rows={4}
            value={novedadForm.descripcion}
            onChange={(e) => setNovedadForm((c) => ({ ...c, descripcion: e.target.value }))}
            placeholder="Detalle de la novedad"
            disabled={loading}
          />
        </label>
        <button className="primary-button" type="submit" disabled={loading}>
          Crear novedad
        </button>
      </form>

      <div className="panel-card list-card">
        <div className="card-title">
          <h2>Novedades creadas</h2>
          <p>Usa este módulo para validar incidencias y ausencias.</p>
        </div>
        <div className="records-list">
          {novedades.map((n) => (
            <article key={n.id} className="record-item">
              <div>
                <strong>{n.tipo}</strong>
                <span>
                  {n.vendedorDocumento} · {n.fecha}
                </span>
                <small>
                  {n.horas} horas · {n.incidenteNumero || '-'}
                </small>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => void onDeleteNovedad(n.id)}
                disabled={loading}
              >
                Eliminar
              </button>
            </article>
          ))}
          {!novedades.length && <p className="empty-state">Aún no hay novedades creadas.</p>}
        </div>
      </div>
    </div>
  );
}
