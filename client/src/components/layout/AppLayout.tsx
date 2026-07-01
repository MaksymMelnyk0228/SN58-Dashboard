import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../ui/LoadingState';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

const TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/validators': 'Validators',
  '/miners': 'Miners',
  '/settings': 'Settings',
};

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return <LoadingState label="Checking session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const title =
    TITLES[location.pathname] ??
    (location.pathname.startsWith('/miners/') ? 'Miner details' : 'SN58 Dashboard');

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="main-column">
        <Navbar title={title} onMenu={() => setMenuOpen((open) => !open)} />
        <Outlet />
      </div>
    </div>
  );
}
