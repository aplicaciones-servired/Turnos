import { useEffect, useMemo, useState } from 'react';
import type { NovedadItem, ProgramacionItem, TarifaItem, TurnoItem, VendedorOption } from '@/Types/admin';
import { fetchVendedores } from '@/Services/vendedores.service';
import { fetchNovedades } from '@/Services/novedades.service';
import { fetchProgramaciones } from '@/Services/programaciones.service';
import { fetchTarifas } from '@/Services/tarifas.service';
import { fetchTurnos } from '@/Services/turnos.service';

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [tarifas, setTarifas] = useState<TarifaItem[]>([]);
  const [programaciones, setProgramaciones] = useState<ProgramacionItem[]>([]);
  const [novedades, setNovedades] = useState<NovedadItem[]>([]);

  const counts = useMemo(
    () => ({
      vendedores: vendedores.length,
      turnos: turnos.length,
      tarifas: tarifas.length,
      programaciones: programaciones.length,
      novedades: novedades.length,
    }),
    [novedades.length, programaciones.length, tarifas.length, turnos.length, vendedores.length],
  );

  async function loadAll() {
    setError('');

    try {
      const [vendedoresData, turnosData, tarifasData, programacionesData, novedadesData] = await Promise.all([
        fetchVendedores(),
        fetchTurnos(),
        fetchTarifas(),
        fetchProgramaciones(),
        fetchNovedades(),
      ]);

      setVendedores(vendedoresData);
      setTurnos(turnosData);
      setTarifas(tarifasData);
      setProgramaciones(programacionesData);
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

  return (
    <main className="page-container">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Panel de control</p>
          <h1>Programador de turnos y novedades</h1>
          <p className="hero-copy">
            Gestiona turnos, tarifas, programaciones y novedades en un solo lugar.
          </p>
        </div>

        <div className="stats-grid">
          <article>
            <strong>{counts.vendedores}</strong>
            <span>Vendedores</span>
          </article>
          <article>
            <strong>{counts.turnos}</strong>
            <span>Turnos</span>
          </article>
          <article>
            <strong>{counts.tarifas}</strong>
            <span>Tarifas</span>
          </article>
          <article>
            <strong>{counts.programaciones}</strong>
            <span>Programaciones</span>
          </article>
          <article>
            <strong>{counts.novedades}</strong>
            <span>Novedades</span>
          </article>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="alert neutral">Cargando datos...</div>}

      <section className="content-section">
        <h2>Estado del sistema</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Turnos</h3>
            <p className="info-value">{counts.turnos}</p>
            <p className="info-text">turnos configurados en el sistema</p>
          </div>

          <div className="info-card">
            <h3>Tarifas</h3>
            <p className="info-value">{counts.tarifas}</p>
            <p className="info-text">estructuras de costos definidas</p>
          </div>

          <div className="info-card">
            <h3>Programaciones</h3>
            <p className="info-value">{counts.programaciones}</p>
            <p className="info-text">asignaciones de turnos activas</p>
          </div>

          <div className="info-card">
            <h3>Novedades</h3>
            <p className="info-value">{counts.novedades}</p>
            <p className="info-text">incidencias registradas</p>
          </div>
        </div>
      </section>
    </main>
  );
}
