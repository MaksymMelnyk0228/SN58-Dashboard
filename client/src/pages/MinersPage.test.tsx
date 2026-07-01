import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { miners, pagination } from '../test/fixtures';
import { renderWithProviders } from '../test/render';
import { MinersPage } from './MinersPage';

const listMiners = vi.fn();

vi.mock('../api/miners', async () => {
  const actual = await vi.importActual<typeof import('../api/miners')>('../api/miners');
  return {
    ...actual,
    listMiners: (...args: unknown[]) => listMiners(...args),
    createMiner: vi.fn(),
    updateMiner: vi.fn(),
    deleteMiner: vi.fn(),
  };
});

describe('MinersPage', () => {
  beforeEach(() => {
    listMiners.mockReset();
    listMiners.mockResolvedValue({ data: miners, pagination });
  });

  it('renders miner rows from the API', async () => {
    renderWithProviders(<MinersPage />, { route: '/miners' });

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getByText('0.872')).toBeInTheDocument();
  });

  it('sends search text to the miners API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MinersPage />, { route: '/miners' });
    await screen.findByText('42');

    await user.type(screen.getByLabelText('Search'), '42');

    await waitFor(() => {
      expect(listMiners).toHaveBeenCalledWith(
        expect.objectContaining({ search: '42', page: 1 }),
      );
    });
  });

  it('requests the next page from the API', async () => {
    const user = userEvent.setup();
    listMiners.mockResolvedValue({
      data: miners,
      pagination: { page: 1, limit: 10, total: 15, totalPages: 2 },
    });
    renderWithProviders(<MinersPage />, { route: '/miners' });
    await screen.findByText('42');

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(listMiners).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });
});

describe('Miner form validation', () => {
  it('blocks submit when the hotkey and score are invalid', async () => {
    const user = userEvent.setup();
    const { MinerForm } = await import('../components/miners/MinerForm');
    const onSubmit = vi.fn();

    renderWithProviders(
      <MinerForm
        onSubmit={onSubmit}
        onCancel={() => undefined}
        initial={{
          ...miners[0],
          hotkey: 'bad',
          score: 4,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByText('Use a demo hotkey starting with 5')).toBeInTheDocument();
    expect(screen.getByText('Score must be between 0 and 1')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid payload', async () => {
    const user = userEvent.setup();
    const { MinerForm } = await import('../components/miners/MinerForm');
    const onSubmit = vi.fn();

    renderWithProviders(<MinerForm initial={miners[0]} onSubmit={onSubmit} onCancel={() => undefined} />);

    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: 42,
        hotkey: miners[0].hotkey,
        score: 0.872,
      }),
    );
    expect(within(document.body).getByDisplayValue('42')).toBeInTheDocument();
  });
});
