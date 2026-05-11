import { useEffect, useState, type FormEvent } from 'react';
import type { TarifaItem } from '@/Types/admin';
import { createTarifa, deleteTarifa, fetchTarifas } from '@/Services/tarifas.service';

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

const initialTarifaForm: TarifaForm = {
  nombre: 'Tarifa base',
  valorHoraNormal: '0',
  valorHoraExtraDiurna: '0',
  valorHoraExtraNocturna: '0',
  valorHoraExtraFestiva: '0',
  recargoDiurnoPct: '0',
  recargoNocturnoPct: '0',
  sucursalesId: '',
};

function toNumber(value: string) {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function buildNumberOrZero(value: string) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function TarifasPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tarifas, setTarifas] = useState<TarifaItem[]>([]);
  const [tarifaForm, setTarifaForm] = useState<TarifaForm>(initialTarifaForm);

  async function loadTarifas() {
    setError('');
    try {
      const data = await fetchTarifas();
      setTarifas(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las tarifas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTarifas();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleCreateTarifa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!tarifaForm.valorHoraNormal.trim()) {
      setError('El valor de hora normal es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await createTarifa({
        nombre: tarifaForm.nombre.trim(),
        valorHoraNormal: buildNumberOrZero(tarifaForm.valorHoraNormal),
        valorHoraExtraDiurna: toNumber(tarifaForm.valorHoraExtraDiurna),
        valorHoraExtraNocturna: toNumber(tarifaForm.valorHoraExtraNocturna),
        valorHoraExtraFestiva: toNumber(tarifaForm.valorHoraExtraFestiva),
        recargoDiurnoPct: toNumber(tarifaForm.recargoDiurnoPct),
        recargoNocturnoPct: toNumber(tarifaForm.recargoNocturnoPct),
        sucursalesId: tarifaForm.sucursalesId.trim() || undefined,
      });
      setMessage('Tarifa creada correctamente');
      setTarifaForm(initialTarifaForm);
      await loadTarifas();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear la tarifa');
    } finally {
      setLoading(false);
    }
  }

  async function removeTarifaItem(id: number) {
    try {
      setError('');
      setMessage('');
      await deleteTarifa(id);
      setMessage('Tarifa eliminada correctamente');
      await loadTarifas();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la tarifa');
    }
  }

  return (
    <main className="page-container">
      <section className="page-header">
        <h1>Tarifas</h1>
        <p>Define valores para calcular horas y recargos de cada vendedor.</p>
      </section>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && <div className="alert neutral">Cargando datos...</div>}

      <section className="content-grid">
        <form className="panel-card form-card" onSubmit={handleCreateTarifa}>
          <div className="card-title">
            <h2>Nueva tarifa</h2>
            <p>Crea una nueva estructura de costos.</p>
          </div>

          <label>
            Nombre
            <input
              value={tarifaForm.nombre}
              onChange={(event) =>
                setTarifaForm((current) => ({ ...current, nombre: event.target.value }))
              }
              placeholder="Tarifa base"
            />
          </label>

          <div className="two-columns">
            <label>
              Hora normal
              <input
                type="number"
                step="0.01"
                value={tarifaForm.valorHoraNormal}
                onChange={(event) =>
                  setTarifaForm((current) => ({ ...current, valorHoraNormal: event.target.value }))
                }
              />
            </label>
            <label>
              Hora extra diurna
              <input
                type="number"
                step="0.01"
                value={tarifaForm.valorHoraExtraDiurna}
                onChange={(event) =>
                  setTarifaForm((current) => ({ ...current, valorHoraExtraDiurna: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="two-columns">
            <label>
              Hora extra nocturna
              <input
                type="number"
                step="0.01"
                value={tarifaForm.valorHoraExtraNocturna}
                onChange={(event) =>
                  setTarifaForm((current) => ({ ...current, valorHoraExtraNocturna: event.target.value }))
                }
              />
            </label>
            <label>
              Hora extra festiva
              <input
                type="number"
                step="0.01"
                value={tarifaForm.valorHoraExtraFestiva}
                onChange={(event) =>
                  setTarifaForm((current) => ({ ...current, valorHoraExtraFestiva: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="two-columns">
            <label>
              Recargo diurno %
              <input
                type="number"
                step="0.01"
                value={tarifaForm.recargoDiurnoPct}
                onChange={(event) =>
                  setTarifaForm((current) => ({ ...current, recargoDiurnoPct: event.target.value }))
                }
              />
            </label>
            <label>
              Recargo nocturno %
              <input
                type="number"
                step="0.01"
                value={tarifaForm.recargoNocturnoPct}
                onChange={(event) =>
                  setTarifaForm((current) => ({ ...current, recargoNocturnoPct: event.target.value }))
                }
              />
            </label>
          </div>

          <label>
            Sucursal / código punto
            <input
              value={tarifaForm.sucursalesId}
              onChange={(event) =>
                setTarifaForm((current) => ({ ...current, sucursalesId: event.target.value }))
              }
              placeholder="SUC001"
            />
          </label>

          <button className="primary-button" type="submit">
            Crear tarifa
          </button>
        </form>

        <div className="panel-card list-card">
          <div className="card-title">
            <h2>Tarifas creadas</h2>
            <p>{tarifas.length} tarifa{tarifas.length !== 1 ? 's' : ''} disponible{tarifas.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="records-list">
            {tarifas.map((tarifa) => (
              <article key={tarifa.id} className="record-item">
                <div>
                  <strong>{tarifa.nombre || 'Sin nombre'}</strong>
                  <span>Normal: ${tarifa.valorHoraNormal}</span>
                  <small>Sucursal: {tarifa.sucursalesId || '-'}</small>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void removeTarifaItem(tarifa.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
            {!tarifas.length && <p className="empty-state">Aún no hay tarifas creadas.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
