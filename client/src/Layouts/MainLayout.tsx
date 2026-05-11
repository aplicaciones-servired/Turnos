import type { ReactNode } from 'react';
import type { PageType } from '@/Router';

interface MainLayoutProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  children: ReactNode;
}

export function MainLayout({ currentPage, onNavigate, children }: MainLayoutProps) {
  const menuItems: { id: PageType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Panel', icon: '📊' },
    { id: 'turnos', label: 'Turnos', icon: '🕐' },
    { id: 'tarifas', label: 'Tarifas', icon: '💰' },
    { id: 'programaciones', label: 'Programaciones', icon: '📅' },
    { id: 'novedades', label: 'Novedades', icon: '📝' },
  ];

  return (
    <div className="app-layout">
      <nav className="sidebar-nav">
        <div className="nav-header">
          <h1>Turnos</h1>
          <p className="nav-subtitle">Sistema de programación</p>
        </div>

        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="app-content">
        {children}
      </div>
    </div>
  );
}
