import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Validator } from '@sn58/shared';
import { listValidators } from '../api/validators';
import { getApiErrorMessage } from '../api/client';
import { DataTable, type Column } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { LoadingState } from '../components/ui/LoadingState';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { StatusBadge } from '../components/ui/Badge';
import { formatDate, formatNumber, truncateHotkey } from '../lib/format';

export function ValidatorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const query = useQuery({
    queryKey: ['validators', { page, search, status, sortBy, sortOrder }],
    queryFn: () =>
      listValidators({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const columns: Column<Validator>[] = [
    { key: 'uid', header: 'UID', sortable: true },
    {
      key: 'hotkey',
      header: 'Hotkey',
      render: (row) => (
        <span className="hotkey" title={row.hotkey}>
          {truncateHotkey(row.hotkey)}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'stake',
      header: 'Stake',
      sortable: true,
      render: (row) => formatNumber(row.stake, 2),
    },
    {
      key: 'emissions',
      header: 'Emissions',
      sortable: true,
      render: (row) => formatNumber(row.emissions, 4),
    },
    { key: 'rank', header: 'Rank', sortable: true },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      sortable: true,
      render: (row) => formatDate(row.lastUpdated),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Validators</h1>
          <p className="muted">Simulated validator set. Addresses are fake demo values.</p>
        </div>
      </div>
      <div className="toolbar">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <FilterDropdown
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'jailed', label: 'Jailed' },
          ]}
        />
      </div>
      {query.isLoading ? <LoadingState label="Loading validators…" /> : null}
      {query.isError ? (
        <ErrorState
          message={getApiErrorMessage(query.error, 'Unable to load validators')}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data && query.data.data.length === 0 ? (
        <EmptyState title="No validators found" detail="Try a different search or status filter." />
      ) : null}
      {query.data && query.data.data.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            rows={query.data.data}
            rowKey={(row) => row.id}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(key) => {
              if (sortBy === key) {
                setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
              } else {
                setSortBy(key);
                setSortOrder('asc');
              }
              setPage(1);
            }}
          />
          <Pagination meta={query.data.pagination} onPageChange={setPage} />
        </>
      ) : null}
    </div>
  );
}
