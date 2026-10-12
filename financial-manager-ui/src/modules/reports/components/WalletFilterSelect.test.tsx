import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletFilterSelect } from './WalletFilterSelect';
import type { Wallet } from '../../wallets/hooks/useWallets';

const wallets: Wallet[] = [
  { id: 'w1', name: 'Nubank', type: 'checking', scope: 'personal', balance: 100, currency: 'BRL', isPrimary: true },
  { id: 'w2', name: 'Nubank Crédito', type: 'credit', scope: 'personal', balance: -50, currency: 'BRL', isPrimary: false },
];

describe('WalletFilterSelect', () => {
  it('shows "all wallets" when nothing is selected', () => {
    render(<WalletFilterSelect wallets={wallets} selectedIds={[]} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /filtrar por carteira/i })).toHaveTextContent('Todas as carteiras');
  });

  it('adds a wallet to the selection when its checkbox is ticked', () => {
    const onChange = vi.fn();
    render(<WalletFilterSelect wallets={wallets} selectedIds={['w1']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /filtrar por carteira/i }));
    fireEvent.click(screen.getByLabelText('Nubank Crédito'));

    expect(onChange).toHaveBeenCalledWith(['w1', 'w2']);
  });

  it('removes a wallet from the selection when its checkbox is unticked', () => {
    const onChange = vi.fn();
    render(<WalletFilterSelect wallets={wallets} selectedIds={['w1', 'w2']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /filtrar por carteira/i }));
    fireEvent.click(screen.getByLabelText('Nubank'));

    expect(onChange).toHaveBeenCalledWith(['w2']);
  });

  it('clears the whole selection', () => {
    const onChange = vi.fn();
    render(<WalletFilterSelect wallets={wallets} selectedIds={['w1']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /filtrar por carteira/i }));
    fireEvent.click(screen.getByText('Limpar seleção'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders nothing when there are no wallets', () => {
    const { container } = render(<WalletFilterSelect wallets={[]} selectedIds={[]} onChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
