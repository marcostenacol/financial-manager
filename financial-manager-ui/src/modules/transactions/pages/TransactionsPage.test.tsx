import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TransactionsPage } from './TransactionsPage';
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

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('loads transactions on mount and renders the list', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: {
          transactions: [
            {
              id: 't1',
              description: 'Salário',
              amount: 5000,
              type: 'income',
              status: 'completed',
              occurredAt: '2026-07-01T00:00:00.000Z',
              createdAt: '2026-07-01T00:00:00.000Z',
              walletId: 'w1',
              wallet: { name: 'Nubank' },
            },
          ],
          total: 1,
        },
      },
    });

    render(<TransactionsPage />);

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        '/transactions',
        expect.objectContaining({ params: expect.objectContaining({ page: 1, per_page: 10 }) }),
      ),
    );

    await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());
  });

  it('renders the empty state when there are no transactions', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: { transactions: [], total: 0 } },
    });

    render(<TransactionsPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument());
  });
});
