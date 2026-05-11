import { useEffect, useState, type FormEvent } from 'react';
import type { NovedadItem, VendedorOption } from '@/Types/admin';
import { fetchVendedores } from '@/Services/vendedores.service';
import { createNovedad, deleteNovedad, fetchNovedades } from '@/Services/novedades.service';

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
  horas: '0',
  incidenteNumero: '',
  descripcion: '',
};

function buildNumberOrZero(value: string) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function NovedadesPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [novedades, setNovedades] = useState<NovedadItem[]>([]);
  const [novedadForm, setNovedadForm] = useState<NovedadForm>(initialNovedadForm);

  async function loadAll() {
    setError('');

    try {
      const [vendedoresData, novedadesData] = await Promise.all([
        fetchVendedores(),
        fetchNovedades(),
      ]);

      setVendedores(vendedoresData);
      setNovedades(novedadesData);
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

  async function handleCreateNovedad(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!novedadForm.vendedorDocumento.trim() || !novedadForm.fecha.trim()) {
      setError('Debe elegir vendedor y fecha');
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
      setMessage('Novedad creada correctamente');
      setNovedadForm(initialNovedadForm);
      await loadAll();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear la novedad');
    } finally {
      setLoading(false);
    }
  }

  async function removeNovedadItem(id: number) {
    try {
      setError('');
      setMessage('');
      await deleteNovedad(id);
      setMessage('Novedad eliminada correctamente');
      await loadAll();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la novedad');
    }
  }

  return (
    <main className="page-container">
      <section className="page-header">
        <h1>Novedades</h1>
        <p>Registra permisos, incapacidades y ausencias de los vendedores.</p>
      </section>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && <div className="alert neutral">Cargando datos...</div>}

      <section className="content-grid">
        <form className="panel-card form-card" onSubmit={handleCreateNovedad}>
          <div className="card-title">
            <h2>Nueva novedad</h2>
            <p>Registra un nuevo incidente o ausencia.</p>
          </div>

          <label>
            Vendedor
            <select
              value={novedadForm.vendedorDocumento}
              onChange={(event) =>
                setNovedadForm((current) => ({
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
              Fecha
              <input
                type="date"
                value={novedadForm.fecha}
                onChange={(event) =>
                  setNovedadForm((current) => ({
                    ...current,
                    fecha: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Tipo
              <select
                value={novedadForm.tipo}
                onChange={(event) =>
                  setNovedadForm((current) => ({
                    ...current,
                    tipo: event.target.value as NovedadItem['tipo'],
                  }))
                }
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
              onChange={(event) =>
                setNovedadForm((current) => ({
                  ...current,
                  horas: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Incidente / mesa de ayuda
            <input
              value={novedadForm.incidenteNumero}
              onChange={(event) =>
                setNovedadForm((current) => ({
                  ...current,
                  incidenteNumero: event.target.value,
                }))
              }
              placeholder="INC-1001"
            />
          </label>

          <label>
            Descripción
            <textarea
              rows={4}
              value={novedadForm.descripcion}
              onChange={(event) =>
                setNovedadForm((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
              placeholder="Detalle de la novedad"
            />
          </label>

          <button className="primary-button" type="submit">
            Crear novedad
          </button>
        </form>

        <div className="panel-card list-card">
          <div className="card-title">
            <h2>Novedades registradas</h2>
            <p>{novedades.length} novedad{novedades.length !== 1 ? 'es' : ''} registrada{novedades.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="records-list">
            {novedades.map((novedad) => (
              <article key={novedad.id} className="record-item">
                <div>
                  <strong>{novedad.tipo}</strong>
                  <span>
                    {novedad.vendedorDocumento} · {novedad.fecha}
                  </span>
                  <small>
                    {novedad.horas} horas · {novedad.incidenteNumero || '-'}
                  </small>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void removeNovedadItem(novedad.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
            {!novedades.length && (
              <p className="empty-state">Aún no hay novedades creadas.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
