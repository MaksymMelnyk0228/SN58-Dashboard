import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { LoginPage } from './LoginPage';

const loginMock = vi.fn();

vi.mock('../api/assessment', () => ({
  getCandidateKey: vi.fn().mockResolvedValue({
    key: 'SN58-11111111-2222-3333-4444-555555555555',
    createdAt: '2026-01-01T00:00:00.000Z',
  }),
}));

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../context/AuthContext')>(
    '../context/AuthContext',
  );
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      loading: false,
      login: loginMock,
      register: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('submits credentials to the auth layer', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue(undefined);
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'ChangeMe123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('admin@example.com', 'ChangeMe123!');
    });
    expect(
      await screen.findByText('SN58-11111111-2222-3333-4444-555555555555'),
    ).toBeInTheDocument();
  });

  it('shows an API error when login fails', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new Error('Invalid email or password'));
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
