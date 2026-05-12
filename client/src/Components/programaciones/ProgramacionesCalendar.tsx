import type { ProgramacionItem, SucursalOption } from '@/Types/admin';

type Props = {
  calendarWeeks: Array<Array<Date | null>>;
  weekdays: string[];
  programacionesByDate: Record<string, ProgramacionItem[]>;
  vendedorByDocumento: Map<string, string>;
  turnoById: Map<number, string>;
  sucursales: SucursalOption[];
  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  selectedSucursal: string;
  setSelectedSucursal: (v: string) => void;
  selectedSucursalLabel: string;
  filteredCount: number;
  loading: boolean;
  onExport: () => void;
};

export function ProgramacionesCalendar({
  calendarWeeks,
  weekdays,
  programacionesByDate,
  vendedorByDocumento,
  turnoById,
  sucursales,
  selectedMonth,
  setSelectedMonth,
  selectedSucursal,
  setSelectedSucursal,
  selectedSucursalLabel,
  filteredCount,
  loading,
  onExport,
}: Props) {
  function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <div className={`panel-card list-card schedule-card`}>
      <div className="card-title schedule-title">
        <div>
          <h2>Vista mensual</h2>
          <p>Tablero de programación por día, sucursal y turno.</p>
        </div>
        <div className="schedule-filters">
          <label>
            Mes
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={loading} />
          </label>
          <label>
            Sucursal
            <select value={selectedSucursal} onChange={(e) => setSelectedSucursal(e.target.value)} disabled={loading}>
              <option value="">Todas</option>
              {sucursales.map((sucursal) => (
                <option key={sucursal.CODIGO} value={sucursal.CODIGO}>
                  {sucursal.NOMBRE || sucursal.CODIGO}
                </option>
              ))}
            </select>
          </label>
          <div className="export-actions">
            <button type="button" className="secondary-button" onClick={onExport} disabled={loading}>Exportar Excel (calendario)</button>
          </div>
        </div>
      </div>

      <p className="schedule-meta">Mostrando: {selectedSucursalLabel} · {filteredCount} asignaciones</p>

      <div className="schedule-grid-wrapper">
        <table className="schedule-grid" aria-label="Calendario de programaciones">
          <thead>
            <tr>
              {weekdays.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarWeeks.map((week, weekIndex) => (
              <tr key={`week-${weekIndex}`}>
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <td key={`empty-${weekIndex}-${dayIndex}`} className="calendar-empty" />;
                  }

                  const dateKey = toDateKey(date);
                  const items = programacionesByDate[dateKey] ?? [];
                  const isFullDaySingle = items.length > 0 && items.every((it) => it.vendedorDocumento === items[0].vendedorDocumento);
                  const fullDayName = isFullDaySingle ? (vendedorByDocumento.get(items[0].vendedorDocumento) || items[0].vendedorDocumento) : null;

                  return (
                    <td key={dateKey} className={dayIndex === 0 ? 'calendar-sunday' : ''}>
                      <div className="calendar-day-number">{date.getDate()}</div>
                      {isFullDaySingle ? (
                        <div className="calendar-fullday">
                          <div className="calendar-fullday-name">{fullDayName}</div>
                        </div>
                      ) : (
                        <div className="calendar-items">
                          {items.map((item) => (
                            <div key={item.id} className="calendar-item">
                              <strong>T{item.turnoId}</strong>
                              <span>{vendedorByDocumento.get(item.vendedorDocumento) || item.vendedorDocumento}</span>
                              <small>{turnoById.get(item.turnoId) || `Turno ${item.turnoId}`}</small>
                            </div>
                          ))}
                          {!items.length && <span className="calendar-empty-text">Sin asignación</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProgramacionesCalendar;
