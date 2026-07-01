import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { dashboardStats } from '../test/fixtures';
import { renderWithProviders } from '../test/render';
import { DashboardPage } from './DashboardPage';

vi.mock('../api/dashboard', () => ({
  getDashboardStats: vi.fn().mockResolvedValue(dashboardStats),
  getDashboardActivity: vi.fn().mockResolvedValue([
    {
      id: 'a1',
      type: 'miner_scored',
      message: 'Simulated miner scored for miner UID 42',
      entityType: 'miner',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ]),
}));

describe('DashboardPage', () => {
  it('renders stats returned by the API', async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Total Validators')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('0.642')).toBeInTheDocument();
    expect(screen.getByText('Simulated miner scored for miner UID 42')).toBeInTheDocument();
  });
});
