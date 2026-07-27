import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useAuth } from '../../../contexts/useAuth';

vi.mock('../../../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('requires email and password before submit (native HTML validation)', () => {
    const signIn = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ signIn } as unknown as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const emailInput = screen.getByPlaceholderText('Seu e-mail') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Sua senha') as HTMLInputElement;

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('calls signIn with typed credentials and navigates on success', async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({ signIn } as unknown as ReturnType<typeof useAuth>);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('Seu e-mail'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Sua senha'), 'secret123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(signIn).toHaveBeenCalledWith({ email: 'john@example.com', password: 'secret123' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/'));
  });

  it('shows an error message when signIn rejects', async () => {
    const signIn = vi.fn().mockRejectedValue(new Error('invalid credentials'));
    vi.mocked(useAuth).mockReturnValue({ signIn } as unknown as ReturnType<typeof useAuth>);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('Seu e-mail'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Sua senha'), 'wrong-pass');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText('Erro ao realizar login. Tente novamente.')).toBeInTheDocument(),
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
