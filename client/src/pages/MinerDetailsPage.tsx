import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getMiner } from '../api/miners';
import { getApiErrorMessage } from '../api/client';
import { StatusBadge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';
import { LineChart } from '../components/ui/LineChart';
import { LoadingState } from '../components/ui/LoadingState';
import { formatDate, formatNumber } from '../lib/format';

export function MinerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ['miner', id],
    queryFn: () => getMiner(id!),
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return (
      <div className="page">
        <LoadingState label="Loading miner…" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="page">
        <ErrorState
          message={getApiErrorMessage(query.error, 'Unable to load miner')}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  const miner = query.data;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Miner UID {miner.uid}</h1>
          <p className="muted">Demo identity — not a live SN58 hotkey.</p>
        </div>
        <Link to="/miners">Back to miners</Link>
      </div>

      <section className="detail-grid">
        <div className="detail-item">
          <span>UID</span>
          <strong>{miner.uid}</strong>
        </div>
        <div className="detail-item">
          <span>Hotkey</span>
          <strong className="hotkey">{miner.hotkey}</strong>
        </div>
        <div className="detail-item">
          <span>Score</span>
          <strong>{formatNumber(miner.score, 3)}</strong>
        </div>
        <div className="detail-item">
          <span>Rank</span>
          <strong>{miner.rank}</strong>
        </div>
        <div className="detail-item">
          <span>Emissions</span>
          <strong>{formatNumber(miner.emissions, 4)}</strong>
        </div>
        <div className="detail-item">
          <span>Status</span>
          <StatusBadge status={miner.status} />
        </div>
        <div className="detail-item">
          <span>Created At</span>
          <strong>{formatDate(miner.createdAt)}</strong>
        </div>
        <div className="detail-item">
          <span>Updated At</span>
          <strong>{formatDate(miner.updatedAt)}</strong>
        </div>
      </section>

      <section className="card">
        <h2>Score history</h2>
        <LineChart points={miner.performanceHistory} valueKey="score" label="Simulated score" />
      </section>

      <section className="card">
        <h2>Emission history</h2>
        <LineChart
          points={miner.performanceHistory}
          valueKey="emissions"
          color="#6cb6ff"
          label="Simulated emissions"
        />
      </section>

      <section className="card">
        <h2>Activity history</h2>
        {miner.activityHistory.length === 0 ? (
          <p className="muted">No activity records for this miner.</p>
        ) : (
          <ul className="activity-list">
            {miner.activityHistory.map((item) => (
              <li key={item.id}>
                <strong>{item.type.replaceAll('_', ' ')}</strong>
                <p>{item.message}</p>
                <small className="muted">{formatDate(item.createdAt)}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
