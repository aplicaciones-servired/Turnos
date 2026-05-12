import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { NovedadItem, VendedorOption } from '@/Types/admin';
import { fetchVendedores } from '@/Services/vendedores.service';
import { createNovedad, deleteNovedad, fetchNovedades } from '@/Services/novedades.service';
import { useToast } from '@/Components/ui/toast';

type NovedadForm = {
  vendedorDocumento: string;
  fecha: string;
  tipo: NovedadItem['tipo'];
  horas: string;
  incidenteNumero: string;
  descripcion: string;
};

const initialNovedadForm: NovedadForm = {
  vendedorDocumento: '',
  fecha: '',
  tipo: 'permiso',
  horas: '0.0',
  incidenteNumero: '',
  descripcion: '',
};

function buildNumberOrZero(value: string) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function NovedadesModule() {
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [novedades, setNovedades] = useState<NovedadItem[]>([]);
  const [searchTicket, setSearchTicket] = useState<string>('');
  const [novedadForm, setNovedadForm] = useState<NovedadForm>(initialNovedadForm);
  const { showToast } = useToast();

  const loadAll = useCallback(async () => {
    try {
      const [vendedoresResult, novedadesResult] = await Promise.allSettled([
        fetchVendedores(),
        fetchNovedades(),
      ]);

      const vendedoresData = vendedoresResult.status === 'fulfilled' ? vendedoresResult.value : [];
      const novedadesData = novedadesResult.status === 'fulfilled' ? novedadesResult.value : [];

      setVendedores(vendedoresData);
      setNovedades(novedadesData);

      const errores = [vendedoresResult, novedadesResult]
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!novedadForm.vendedorDocumento.trim() || !novedadForm.fecha.trim()) {
      showToast({
        title: 'Debe elegir vendedor y fecha',
        tone: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      await createNovedad({
        vendedorDocumento: novedadForm.vendedorDocumento.trim(),
        fecha: novedadForm.fecha,
        tipo: novedadForm.tipo,
        horas: buildNumberOrZero(novedadForm.horas),
        incidenteNumero: novedadForm.incidenteNumero.trim() || undefined,
        descripcion: novedadForm.descripcion.trim() || undefined,
      });
      showToast({
        title: 'Novedad creada correctamente',
        tone: 'success',
      });
      // after create, try to reload and show latest including ticket
      setNovedadForm(initialNovedadForm);
      await loadAll();
    } catch (createError) {
      showToast({
        title: 'No se pudo crear la novedad',
        description: createError instanceof Error ? createError.message : 'Error desconocido',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeNovedadItem(id: number) {
    try {
      await deleteNovedad(id);
      showToast({
        title: 'Novedad eliminada correctamente',
        tone: 'success',
      });
      await loadAll();
    } catch (deleteError) {
      showToast({
        title: 'No se pudo eliminar la novedad',
        description: deleteError instanceof Error ? deleteError.message : 'Error desconocido',
        tone: 'error',
      });
    }
  }

  async function handleSearchByTicket() {
    if (!searchTicket.trim()) {
      await loadAll();
      return;
    }
    const ticketNum = Number(searchTicket.trim());
    if (Number.isNaN(ticketNum)) {
      showToast({ title: 'Ticket inválido', tone: 'warning' });
      return;
    }
    try {
      setLoading(true);
      const result = await (await import('@/Services/novedades.service')).fetchNovedadByTicket(ticketNum);
      setNovedades(result ? [result] : []);
    } catch (err) {
      showToast({ title: 'No se encontró la novedad', tone: 'warning' });
      setNovedades([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={handleSubmit}>
        <div className="card-title">
          <h2>Nueva novedad</h2>
          <p>Registra permisos, incapacidades y ausencias.</p>
        </div>
        {loading && <div className="alert neutral">Cargando datos...</div>}
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input placeholder="Buscar por TK" value={searchTicket} onChange={(e) => setSearchTicket(e.target.value)} />
          <button className="ghost-button" type="button" onClick={() => void handleSearchByTicket()}>Buscar</button>
          <button className="ghost-button" type="button" onClick={() => { setSearchTicket(''); void loadAll(); }}>Limpiar</button>
        </div>
        <div className="records-list">
          {novedades.map((n) => (
            <article key={n.id} className="record-item">
              <div>
                <strong>{n.tipo} {n.ticketNumber ? `· TK-${n.ticketNumber}` : ''}</strong>
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
                onClick={() => void removeNovedadItem(n.id)}
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
