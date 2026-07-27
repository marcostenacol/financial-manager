import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

function TestConsumer() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <span>loading</span>;

  return (
    <div>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
      <button onClick={() => signIn({ email: 'john@example.com', password: '123456' })}>sign-in</button>
      <button onClick={() => signOut()}>sign-out</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(api.post).mockReset();
  });

  it('starts with no user and loading resolved from empty storage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('no-user'));
  });

  it('signIn stores token/user and updates state', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        data: {
          token: 'access-token',
          refresh_token: 'refresh-token',
          user: { id: '1', name: 'John', email: 'john@example.com' },
        },
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('no-user'));

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByText('sign-in'));
    });

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('john@example.com'));
    expect(localStorage.getItem('@FinancialManager:token')).toBe('access-token');
    expect(localStorage.getItem('@FinancialManager:refreshToken')).toBe('refresh-token');
  });

  it('signOut clears storage and user state', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        data: {
          token: 'access-token',
          refresh_token: 'refresh-token',
          user: { id: '1', name: 'John', email: 'john@example.com' },
        },
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByText('sign-in'));
    });
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('john@example.com'));

    await act(async () => {
      await user.click(screen.getByText('sign-out'));
    });

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('no-user'));
    expect(localStorage.getItem('@FinancialManager:token')).toBeNull();
  });
});
