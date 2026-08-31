import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Trash2 } from 'lucide-react';
import { useCreditCards, type InvoiceDetail } from '../hooks/useCreditCards';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  walletId: string | null;
  invoiceId: string | null;
  onClose: () => void;
  onChanged: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const InvoiceDetailModal = ({ isOpen, walletId, invoiceId, onClose, onChanged }: InvoiceDetailModalProps) => {
  const { showToast } = useToast();
  const { loadInvoiceDetail, registerPayment, deletePayment } = useCreditCards();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    if (!walletId || !invoiceId) return;
    try {
      const data = await loadInvoiceDetail(walletId, invoiceId);
      setInvoice(data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao carregar fatura'), 'error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentAmount(0);
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, walletId, invoiceId]);

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !invoiceId || paymentAmount <= 0) return;
    setSubmitting(true);
    try {
      await registerPayment(walletId, invoiceId, { amount: paymentAmount });
      setPaymentAmount(0);
      await fetchDetail();
      onChanged();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao registrar pagamento'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!walletId || !invoiceId || !window.confirm('Remover este pagamento?')) return;
    try {
      await deletePayment(walletId, invoiceId, paymentId);
      await fetchDetail();
      onChanged();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao remover pagamento'), 'error');
    }
  };

  if (!isOpen || !walletId || !invoiceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">Fatura {invoice?.referenceMonth ?? ''}</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {invoice && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-app-muted text-xs uppercase">Total</p>
                <p className="ledger-figure text-lg text-app-ink">{formatCurrency(invoice.totalAmount)}</p>
              </div>
              <div>
                <p className="text-app-muted text-xs uppercase">Pago</p>
                <p className="ledger-figure text-lg text-app-success">{formatCurrency(invoice.paidAmount)}</p>
              </div>
              <div>
                <p className="text-app-muted text-xs uppercase">Falta</p>
                <p className="ledger-figure text-lg text-app-danger">{formatCurrency(invoice.remainingAmount)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-app-ink font-bold mb-2">Transações</h3>
              <div className="space-y-2">
                {invoice.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-app-surface-2 border border-app-border rounded-2xl p-3">
                    <div>
                      <p className="text-app-ink text-sm">{t.description}</p>
                      {t.person && (
                        <span className="flex items-center gap-1 text-xs text-app-accent">
                          <User className="w-3 h-3" /> {t.person.name}
                        </span>
                      )}
                    </div>
                    <span className={`ledger-figure text-sm ${t.type === 'income' ? 'text-app-success' : 'text-app-danger'}`}>
                      {t.type === 'income' ? '+' : '−'} {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
                {invoice.transactions.length === 0 && (
                  <p className="text-app-muted text-sm">Nenhuma transação nesta fatura.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-app-ink font-bold mb-2">Pagamentos</h3>
              <div className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-app-surface-2 border border-app-border rounded-2xl p-3">
                    <div>
                      <p className="text-app-ink text-sm">{formatCurrency(p.amount)}</p>
                      <p className="text-app-muted text-xs">{new Date(p.paidAt).toLocaleDateString('pt-BR')}{p.note ? ` — ${p.note}` : ''}</p>
                    </div>
                    <button onClick={() => handleDeletePayment(p.id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {invoice.payments.length === 0 && (
                  <p className="text-app-muted text-sm">Nenhum pagamento registrado ainda.</p>
                )}
              </div>
            </div>

            {invoice.remainingAmount > 0 && (
              <form onSubmit={handleRegisterPayment} className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-app-muted ml-1">Registrar pagamento (total ou parcial)</label>
                  <CurrencyInput
                    value={paymentAmount}
                    onChange={setPaymentAmount}
                    className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || paymentAmount <= 0}
                  className="bg-app-accent hover:opacity-90 text-app-ink font-bold py-3 px-6 rounded-2xl disabled:opacity-50"
                >
                  Registrar
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
