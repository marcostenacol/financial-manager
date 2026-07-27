import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { api } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  api: { post: vi.fn() },
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    vi.mocked(api.post).mockReset();
  });

  it('marks name/email/password inputs as required', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText('Seu nome completo')).toBeRequired();
    expect(screen.getByPlaceholderText('Seu e-mail')).toBeRequired();
    expect(screen.getByPlaceholderText('Crie uma senha')).toBeRequired();
  });

  it('submits registration data and redirects to /login on success', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Seu e-mail'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Crie uma senha'), 'secret123');
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
      }),
    );
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/login', {
        state: { message: 'Conta criada com sucesso! Faça login para continuar.' },
      }),
    );
  });

  it('shows an error message when registration fails', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('email already exists'));

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Seu e-mail'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Crie uma senha'), 'secret123');
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() =>
      expect(screen.getByText('Erro ao criar conta. Tente novamente.')).toBeInTheDocument(),
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
