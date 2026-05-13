import { useState, useEffect, useCallback } from 'react';
import type { CalculoHorasItem, VendedorOption } from '@/Types/admin';
import { obtenerCalculoPeriodo, generarCalculoHoras, cambiarEstadoCalculo } from '@/Services/calculoHoras.service';
import { fetchVendedores } from '@/Services/vendedores.service';
import { useToast } from '@/Components/ui/toast';

export function NominaPage() {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [calculos, setCalculos] = useState<CalculoHorasItem[]>([]);
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const { showToast } = useToast();

  // Cargar vendedores
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchVendedores();
        setVendedores(data);
      } catch (err) {
        showToast({
          title: 'Error al cargar vendedores',
          description: (err as Error).message,
          tone: 'error',
        });
      }
    })();
  }, [showToast]);

  // Cargar cálculos del período
  const cargarCalculos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerCalculoPeriodo(mes, anio);
      setCalculos(data);
    } catch (err) {
      showToast({
        title: 'Error al cargar cálculos',
        description: (err as Error).message,
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [mes, anio, showToast]);

  useEffect(() => {
    void cargarCalculos();
  }, [cargarCalculos]);

  // Generar cálculos para todos los vendedores
  async function generarTodos() {
    try {
      setGenerando(true);
      let generados = 0;
      let errores = 0;

      for (const vendedor of vendedores) {
        try {
          await generarCalculoHoras(vendedor.DOCUMENTO, mes, anio);
          generados++;
        } catch (err) {
          console.error(`Error para ${vendedor.DOCUMENTO}:`, err);
          errores++;
        }
      }

      showToast({
        title: `Nómina generada: ${generados}/${vendedores.length}`,
        description: errores > 0 ? `${errores} vendedores con error` : 'Todos procesados',
        tone: errores === 0 ? 'success' : 'warning',
      });

      await cargarCalculos();
    } catch (err) {
      showToast({
        title: 'Error al generar nómina',
        description: (err as Error).message,
        tone: 'error',
      });
    } finally {
      setGenerando(false);
    }
  }

  // Cambiar estado
  async function cambiarEstado(id: number, nuevoEstado: 'borrador' | 'procesado' | 'pagado') {
    try {
      await cambiarEstadoCalculo(id, nuevoEstado);
      await cargarCalculos();
      showToast({
        title: 'Estado actualizado',
        tone: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Error al cambiar estado',
        description: (err as Error).message,
        tone: 'error',
      });
    }
  }

  const getNombreVendedor = (doc: string) => {
    return vendedores.find((v) => v.DOCUMENTO === doc)?.NOMBRES || doc;
  };

  const estadoColor: Record<string, string> = {
    borrador: '#fbbf24',
    procesado: '#3b82f6',
    pagado: '#10b981',
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>📊 Nómina y Cálculo de Horas</h1>
        <p>Genera y gestiona cálculos de horas para todos los vendedores.</p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <label>
          Mes
          <input
            type="number"
            min="1"
            max="12"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
          />
        </label>
        <label>
          Año
          <input
            type="number"
            min="2000"
            max={new Date().getFullYear() + 1}
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
          />
        </label>
        <button
          className="primary-button"
          onClick={() => void generarTodos()}
          disabled={generando || loading}
        >
          {generando ? '⏳ Generando...' : '✅ Generar Nómina'}
        </button>
      </div>

      {loading && <div className="alert neutral">Cargando cálculos...</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Vendedor</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Hrs Normales</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Hrs Extra Diurna</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Hrs Extra Nocturna</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Hrs Extra Festiva</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Total $ Bruto</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {calculos.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  No hay cálculos para este período
                </td>
              </tr>
            ) : (
              calculos.map((calc) => (
                <tr key={calc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px' }}>
                    <strong>{getNombreVendedor(calc.vendedorDocumento)}</strong>
                    <br />
                    <small>{calc.vendedorDocumento}</small>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {calc.horasTrabajadasNormales.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {calc.horasExtraDiurna.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {calc.horasExtraNocturna.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {calc.horasExtraFestiva.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${calc.totalCalculado.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: estadoColor[calc.estado || 'borrador'],
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {calc.estado || 'borrador'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <select
                      value={calc.estado || 'borrador'}
                      onChange={(e) =>
                        void cambiarEstado(
                          calc.id,
                          e.target.value as 'borrador' | 'procesado' | 'pagado'
                        )
                      }
                      style={{
                        padding: '4px',
                        fontSize: '0.85rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="borrador">Borrador</option>
                      <option value="procesado">Procesado</option>
                      <option value="pagado">Pagado</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {calculos.length > 0 && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
          <strong>Resumen del período {mes}/{anio}:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
            <div>
              <small>Total Vendedores</small>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{calculos.length}</div>
            </div>
            <div>
              <small>Total $ Bruto</small>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                ${calculos
                  .reduce((sum, c) => sum + c.totalCalculado, 0)
                  .toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <small>Hrs Extra Totales</small>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {(
                  calculos.reduce((sum, c) => sum + c.horasExtraDiurna, 0) +
                  calculos.reduce((sum, c) => sum + c.horasExtraNocturna, 0) +
                  calculos.reduce((sum, c) => sum + c.horasExtraFestiva, 0)
                ).toFixed(2)}
              </div>
            </div>
            <div>
              <small>Pagados</small>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {calculos.filter((c) => c.estado === 'pagado').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
