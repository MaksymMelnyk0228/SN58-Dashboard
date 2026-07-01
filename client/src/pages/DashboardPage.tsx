import { useQuery } from '@tanstack/react-query';
import { getDashboardActivity, getDashboardStats } from '../api/dashboard';
import { getApiErrorMessage } from '../api/client';
import { ErrorState } from '../components/ui/ErrorState';
import { LineChart } from '../components/ui/LineChart';
import { LoadingState } from '../components/ui/LoadingState';
import { StatCard } from '../components/ui/StatCard';
import { formatDate, formatNumber } from '../lib/format';

export function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  });
  const activityQuery = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => getDashboardActivity(12),
  });

  if (statsQuery.isLoading) {
    return (
      <div className="page">
        <LoadingState label="Loading dashboard…" />
      </div>
    );
  }

  if (statsQuery.isError || !statsQuery.data) {
    return (
      <div className="page">
        <ErrorState
          message={getApiErrorMessage(statsQuery.error, 'Unable to load dashboard')}
          onRetry={() => void statsQuery.refetch()}
        />
      </div>
    );
  }

  const stats = statsQuery.data;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Validator overview</h1>
          <p className="muted">Fictional SN58 subnet metrics from the local simulation API.</p>
        </div>
      </div>

      <section className="stat-grid">
        <StatCard label="Total Validators" value={stats.totalValidators} />
        <StatCard label="Active Validators" value={stats.activeValidators} />
        <StatCard label="Total Miners" value={stats.totalMiners} />
        <StatCard label="Average Miner Score" value={formatNumber(stats.averageMinerScore, 3)} />
        <StatCard label="Total Emissions" value={formatNumber(stats.totalEmissions, 4)} />
        <StatCard label="Current Validator Rank" value={stats.currentValidatorRank} />
      </section>

      <section className="card">
        <h2>Miner performance</h2>
        <LineChart
          points={stats.minerPerformanceHistory}
          valueKey="score"
          label="Average simulated miner score"
        />
      </section>

      <section className="card">
        <h2>Recent activity</h2>
        {activityQuery.isLoading ? <LoadingState label="Loading activity…" /> : null}
        {activityQuery.isError ? (
          <ErrorState message={getApiErrorMessage(activityQuery.error, 'Unable to load activity')} />
        ) : null}
        {activityQuery.data?.length === 0 ? <p className="muted">No activity yet.</p> : null}
        <ul className="activity-list">
          {activityQuery.data?.map((item) => (
            <li key={item.id}>
              <strong>{item.type.replaceAll('_', ' ')}</strong>
              <p>{item.message}</p>
              <small className="muted">{formatDate(item.createdAt)}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
