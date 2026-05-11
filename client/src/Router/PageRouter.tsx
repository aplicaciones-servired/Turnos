import { DashboardPage } from '@/Pages/DashboardPage';
import { TurnosPage } from '@/Pages/TurnosPage';
import { TarifasPage } from '@/Pages/TarifasPage';
import { ProgramacionesPage } from '@/Pages/ProgramacionesPage';
import { NovedadesPage } from '@/Pages/NovedadesPage';

export type PageType = 'dashboard' | 'turnos' | 'tarifas' | 'programaciones' | 'novedades';

interface PageRouterProps {
  currentPage: PageType;
}

/**
 * Mapeo de páginas a componentes
 * Más escalable y limpio que switch statements
 */
const pageComponents: Record<PageType, React.ComponentType> = {
  dashboard: DashboardPage,
  turnos: TurnosPage,
  tarifas: TarifasPage,
  programaciones: ProgramacionesPage,
  novedades: NovedadesPage,
};

/**
 * Componente que renderiza la página según el tipo actual
 * Centraliza la lógica de navegación entre páginas
 */
export function PageRouter({ currentPage }: PageRouterProps) {
  const Component = pageComponents[currentPage];
  return <Component />;
}
