import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { Miner } from '@sn58/shared';
import { createMiner, deleteMiner, listMiners, updateMiner, type MinerPayload } from '../api/miners';
import { getApiErrorMessage } from '../api/client';
import { MinerForm } from '../components/miners/MinerForm';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable, type Column } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { LoadingState } from '../components/ui/LoadingState';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { useToast } from '../components/ui/Toast';
import { formatDate, formatNumber, truncateHotkey } from '../lib/format';

export function MinersPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Miner | null>(null);
  const [deleting, setDeleting] = useState<Miner | null>(null);

  const query = useQuery({
    queryKey: ['miners', { page, search, status, sortBy, sortOrder }],
    queryFn: () =>
      listMiners({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['miners'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: createMiner,
    onSuccess: () => {
      notify('Miner created');
      setCreating(false);
      invalidate();
    },
    onError: (error) => notify(getApiErrorMessage(error, 'Create failed'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MinerPayload> }) =>
      updateMiner(id, payload),
    onSuccess: () => {
      notify('Miner updated');
      setEditing(null);
      invalidate();
    },
    onError: (error) => notify(getApiErrorMessage(error, 'Update failed'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMiner,
    onSuccess: () => {
      notify('Miner deleted');
      setDeleting(null);
      invalidate();
    },
    onError: (error) => notify(getApiErrorMessage(error, 'Delete failed'), 'error'),
  });

  const columns: Column<Miner>[] = [
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
    {
      key: 'score',
      header: 'Score',
      sortable: true,
      render: (row) => formatNumber(row.score, 3),
    },
    { key: 'rank', header: 'Rank', sortable: true },
    {
      key: 'emissions',
      header: 'Emissions',
      sortable: true,
      render: (row) => formatNumber(row.emissions, 4),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      sortable: true,
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Link to={`/miners/${row.id}`}>View</Link>
          <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleting(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Miners</h1>
          <p className="muted">Manage simulated miners. All values are fictional demo data.</p>
        </div>
        <Button onClick={() => setCreating(true)}>Create miner</Button>
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
      {query.isLoading ? <LoadingState label="Loading miners…" /> : null}
      {query.isError ? (
        <ErrorState
          message={getApiErrorMessage(query.error, 'Unable to load miners')}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data && query.data.data.length === 0 ? (
        <EmptyState title="No miners found" detail="Create a miner or adjust filters." />
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

      <Modal title="Create miner" open={creating} onClose={() => setCreating(false)}>
        <MinerForm
          submitting={createMutation.isPending}
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal title="Edit miner" open={Boolean(editing)} onClose={() => setEditing(null)}>
        {editing ? (
          <MinerForm
            initial={editing}
            submitting={updateMutation.isPending}
            onSubmit={(payload) => updateMutation.mutate({ id: editing.id, payload })}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>

      <Modal title="Delete miner" open={Boolean(deleting)} onClose={() => setDeleting(null)}>
        <p>Delete miner UID {deleting?.uid}? This cannot be undone.</p>
        <div className="modal-actions">
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deleting && deleteMutation.mutate(deleting.id)}
          >
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
