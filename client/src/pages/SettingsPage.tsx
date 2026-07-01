import { DEMO_NOTICE } from '@sn58/shared';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">Local account and simulation information.</p>
        </div>
      </div>
      <section className="card">
        <h2>Signed-in user</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <span>Name</span>
            <strong>{user?.name}</strong>
          </div>
          <div className="detail-item">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="detail-item">
            <span>User ID</span>
            <strong>{user?.id}</strong>
          </div>
          <div className="detail-item">
            <span>Created</span>
            <strong>{user ? formatDate(user.createdAt) : '—'}</strong>
          </div>
        </div>
      </section>
      <section className="card">
        <h2>Simulation notice</h2>
        <p>{DEMO_NOTICE}</p>
        <p className="muted">
          JWT sessions are issued by the local Express API. No wallet, TAO, or Bittensor node is
          required.
        </p>
      </section>
    </div>
  );
}
