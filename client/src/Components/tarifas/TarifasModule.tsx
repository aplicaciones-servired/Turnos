import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { TarifaItem } from '@/Types/admin';
import { createTarifa, deleteTarifa, fetchTarifas } from '@/Services/tarifas.service';
import { useToast } from '@/Components/ui/toast';

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

export function TarifasModule() {
  const [loading, setLoading] = useState(true);
  const [tarifas, setTarifas] = useState<TarifaItem[]>([]);
  const [tarifaForm, setTarifaForm] = useState<TarifaForm>(initialTarifaForm);
  const { showToast } = useToast();

  const loadTarifas = useCallback(async () => {
    try {
      const data = await fetchTarifas();
      setTarifas(data);
    } catch (loadError) {
      showToast({
        title: 'No se pudieron cargar las tarifas',
        description: loadError instanceof Error ? loadError.message : 'Error desconocido',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTarifas();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTarifas]);

  async function handleCreateTarifa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tarifaForm.valorHoraNormal.trim()) {
      showToast({
        title: 'El valor de hora normal es obligatorio',
        tone: 'warning',
      });
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
      showToast({
        title: 'Tarifa creada correctamente',
        tone: 'success',
      });
      setTarifaForm(initialTarifaForm);
      await loadTarifas();
    } catch (createError) {
      showToast({
        title: 'No se pudo crear la tarifa',
        description: createError instanceof Error ? createError.message : 'Error desconocido',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeTarifaItem(id: number) {
    try {
      await deleteTarifa(id);
      showToast({
        title: 'Tarifa eliminada correctamente',
        tone: 'success',
      });
      await loadTarifas();
    } catch (deleteError) {
      showToast({
        title: 'No se pudo eliminar la tarifa',
        description: deleteError instanceof Error ? deleteError.message : 'Error desconocido',
        tone: 'error',
      });
    }
  }

  return (
    <div className="panel-grid">
      <form className="panel-card form-card" onSubmit={handleCreateTarifa}>
        <div className="card-title">
          <h2>Nueva tarifa</h2>
          <p>Define valores para calcular horas y recargos.</p>
        </div>
        {loading && <div className="alert neutral">Cargando datos...</div>}
        <label>
          Nombre
          <input value={tarifaForm.nombre} onChange={(event) => setTarifaForm((current) => ({ ...current, nombre: event.target.value }))} placeholder="Tarifa base" disabled={loading} />
        </label>
        <div className="two-columns">
          <label>
            Hora normal
            <input type="number" step="0.01" value={tarifaForm.valorHoraNormal} onChange={(event) => setTarifaForm((current) => ({ ...current, valorHoraNormal: event.target.value }))} disabled={loading} />
          </label>
          <label>
            Hora extra diurna
            <input type="number" step="0.01" value={tarifaForm.valorHoraExtraDiurna} onChange={(event) => setTarifaForm((current) => ({ ...current, valorHoraExtraDiurna: event.target.value }))} disabled={loading} />
          </label>
        </div>
        <div className="two-columns">
          <label>
            Hora extra nocturna
            <input type="number" step="0.01" value={tarifaForm.valorHoraExtraNocturna} onChange={(event) => setTarifaForm((current) => ({ ...current, valorHoraExtraNocturna: event.target.value }))} disabled={loading} />
          </label>
          <label>
            Hora extra festiva
            <input type="number" step="0.01" value={tarifaForm.valorHoraExtraFestiva} onChange={(event) => setTarifaForm((current) => ({ ...current, valorHoraExtraFestiva: event.target.value }))} disabled={loading} />
          </label>
        </div>
        <div className="two-columns">
          <label>
            Recargo diurno %
            <input type="number" step="0.01" value={tarifaForm.recargoDiurnoPct} onChange={(event) => setTarifaForm((current) => ({ ...current, recargoDiurnoPct: event.target.value }))} disabled={loading} />
          </label>
          <label>
            Recargo nocturno %
            <input type="number" step="0.01" value={tarifaForm.recargoNocturnoPct} onChange={(event) => setTarifaForm((current) => ({ ...current, recargoNocturnoPct: event.target.value }))} disabled={loading} />
          </label>
        </div>
        <label>
          Sucursal / código punto
          <input value={tarifaForm.sucursalesId} onChange={(event) => setTarifaForm((current) => ({ ...current, sucursalesId: event.target.value }))} placeholder="SUC001" disabled={loading} />
        </label>
        <button className="primary-button" type="submit" disabled={loading}>Crear tarifa</button>
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
              <button type="button" className="ghost-button" onClick={() => void removeTarifaItem(tarifa.id)} disabled={loading}>Eliminar</button>
            </article>
          ))}
          {!tarifas.length && <p className="empty-state">Aún no hay tarifas creadas.</p>}
        </div>
      </div>
    </div>
  );
}
