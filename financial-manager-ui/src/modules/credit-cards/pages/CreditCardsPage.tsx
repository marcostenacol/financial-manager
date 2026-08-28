import { useState, useEffect } from 'react';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { useCreditCards, type CreditCard, type CreditCardInvoice } from '../hooks/useCreditCards';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { InvoiceDetailModal } from '../components/InvoiceDetailModal';

function statusLabel(status: CreditCardInvoice['status']): string {
  switch (status) {
    case 'open': return 'Em aberto';
    case 'closed': return 'Fechada';
    case 'partially_paid': return 'Parcialmente paga';
    case 'paid': return 'Paga';
  }
}

function statusColor(status: CreditCardInvoice['status']): string {
  switch (status) {
    case 'open': return 'text-app-accent';
    case 'closed': return 'text-app-danger';
    case 'partially_paid': return 'text-amber-400';
    case 'paid': return 'text-app-success';
  }
}

export const CreditCardsPage = () => {
  const { showToast } = useToast();
  const { cards, loading, loadCards, loadInvoices } = useCreditCards();
  const [invoicesByCard, setInvoicesByCard] = useState<Record<string, CreditCardInvoice[]>>({});
  const [selected, setSelected] = useState<{ walletId: string; invoiceId: string } | null>(null);

  const fetchAll = async () => {
    try {
      const cardsData = await loadCards();
      const entries = await Promise.all(
        cardsData.map(async (card) => [card.id, await loadInvoices(card.id)] as const),
      );
      setInvoicesByCard(Object.fromEntries(entries));
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao carregar cartões'), 'error');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-app-surface rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="ledger-title text-4xl text-app-ink">Cartões</h1>
        <p className="text-app-muted">Faturas, parcelas e pagamentos dos seus cartões de crédito</p>
      </div>

      {cards.length === 0 && (
        <div className="bg-app-surface border border-app-border rounded-3xl p-12 flex flex-col items-center text-center">
          <CreditCardIcon className="w-12 h-12 text-app-muted mb-4" />
          <h3 className="text-app-ink font-bold text-lg">Nenhum cartão cadastrado</h3>
          <p className="text-app-muted mt-1 max-w-xs">Crie uma carteira do tipo "Cartão de crédito" na aba Carteiras para vê-la aqui.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card: CreditCard) => {
          const invoices = invoicesByCard[card.id] ?? [];
          const current = invoices[invoices.length - 1];

          return (
            <div key={card.id} className="bg-app-surface border border-app-border rounded-3xl p-6 shadow-app-card">
              <h3 className="text-app-ink font-bold text-lg mb-1">{card.name}</h3>
              {current ? (
                <>
                  <p className="text-app-muted text-xs uppercase tracking-widest">Fatura {current.referenceMonth}</p>
                  <p className="ledger-figure text-2xl text-app-ink mt-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(current.totalAmount)}
                  </p>
                  <span className={`ledger-stamp mt-2 ${statusColor(current.status)}`}>{statusLabel(current.status)}</span>
                  <div className="mt-4">
                    <button
                      onClick={() => setSelected({ walletId: card.id, invoiceId: current.id })}
                      className="text-sm font-bold text-app-accent hover:underline"
                    >
                      Ver fatura →
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-app-muted text-sm mt-2">Nenhuma fatura ainda.</p>
              )}
            </div>
          );
        })}
      </div>

      <InvoiceDetailModal
        isOpen={!!selected}
        walletId={selected?.walletId ?? null}
        invoiceId={selected?.invoiceId ?? null}
        onClose={() => setSelected(null)}
        onChanged={fetchAll}
      />
    </div>
  );
};
