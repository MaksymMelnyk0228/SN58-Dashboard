import { NavLink } from 'react-router-dom';
import { DEMO_NOTICE } from '@sn58/shared';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/validators', label: 'Validators' },
  { to: '/miners', label: 'Miners' },
  { to: '/settings', label: 'Settings' },
];

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { logout, user } = useAuth();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <strong>SN58 Dashboard</strong>
        <span className="muted">Local simulation</span>
      </div>
      <nav className="sidebar-nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <p className="muted" style={{ fontSize: '0.78rem', padding: '0 8px' }}>
        {DEMO_NOTICE}
      </p>
      <div style={{ marginTop: 'auto' }}>
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          {user?.email}
        </p>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
