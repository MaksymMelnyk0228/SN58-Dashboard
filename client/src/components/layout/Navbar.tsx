import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="row-actions">
        <Button className="menu-btn" variant="secondary" size="sm" onClick={onMenu} type="button">
          Menu
        </Button>
        <div>
          <strong>{title}</strong>
        </div>
      </div>
      <div className="row-actions">
        <Badge variant="info">Local SN58-inspired simulation</Badge>
        <span className="muted">{user?.name}</span>
      </div>
    </header>
  );
}
