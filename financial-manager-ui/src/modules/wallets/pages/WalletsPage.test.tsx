import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WalletsPage } from './WalletsPage';
import { api } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../shared/components/useToast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('WalletsPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('loads wallets on mount and renders them', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'w1', name: 'Nubank', type: 'checking', balance: 1500, currency: 'BRL' },
          { id: 'w2', name: 'Poupança', type: 'savings', balance: 500, currency: 'BRL' },
        ],
      },
    });

    render(<WalletsPage />);

    expect(api.get).toHaveBeenCalledWith('/wallets');

    await waitFor(() => expect(screen.getByText('Nubank')).toBeInTheDocument());
    expect(screen.getByText('Poupança')).toBeInTheDocument();
  });

  it('renders the empty state when there are no wallets', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } });

    render(<WalletsPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma carteira cadastrada.')).toBeInTheDocument());
  });
});
