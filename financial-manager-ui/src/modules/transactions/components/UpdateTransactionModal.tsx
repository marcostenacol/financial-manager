import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, ArrowUpCircle, ArrowDownCircle, Wallet as WalletIcon, Calendar, Tag, FileText, Trash2, User, CreditCard } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../../wallets/hooks/useWallets';
import { useCategories } from '../../categories/hooks/useCategories';
import { usePeople } from '../../people/hooks/usePeople';
import { useCreditCards, type CreditCardInvoice } from '../../credit-cards/hooks/useCreditCards';
import { useScope } from '../../../contexts/useScope';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { isFutureDate } from '../../../shared/lib/isFutureDate';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface Wallet {
  id: string;
  name: string;
  type?: string;
}

const STATUS_OPTIONS: { value: 'pending' | 'completed' | 'cancelled'; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

interface Category {
  id: string;
  name: string;
}

interface Person {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  occurredAt: string;
  walletId: string;
  categoryId?: string;
  personId?: string | null;
  invoiceId?: string | null;
}

interface UpdateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}

export const UpdateTransactionModal = ({ isOpen, onClose, onSuccess, transaction }: UpdateTransactionModalProps) => {
  const { showToast } = useToast();
  const { updateTransaction, deleteTransaction } = useTransactions();
  const { scope } = useScope();
  const { loadWallets } = useWallets(scope);
  const { loadCategories } = useCategories(scope);
  const { loadPeople } = usePeople(scope);
  const { loadInvoices } = useCreditCards();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('pending');
  const [invoiceId, setInvoiceId] = useState('');

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const wallet = wallets.find((w) => w.id === walletId);
  const isCreditWallet = wallet?.type === 'credit';

  const loadData = async () => {
    try {
      const [walletsData, categoriesData, peopleData] = await Promise.all([
        loadWallets(),
        loadCategories(),
        loadPeople(),
      ]);
      setWallets(walletsData);
      setCategories(categoriesData);
      setPeople(peopleData);

      const walletData = walletsData.find((w: Wallet) => w.id === transaction?.walletId);
      if (walletData?.type === 'credit') {
        setInvoices(await loadInvoices(walletData.id));
      } else {
        setInvoices([]);
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao carregar dados para transação'), 'error');
    }
  };

  useEffect(() => {
    if (isOpen && transaction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setType(transaction.type as 'income' | 'expense');
      setDescription(transaction.description);
      setAmount(Number(transaction.amount));
      setWalletId(transaction.walletId);
      setCategoryId(transaction.categoryId || '');
      setPersonId(transaction.personId || '');
      setOccurredAt(new Date(transaction.occurredAt).toISOString().split('T')[0]);
      setStatus(transaction.status);
      setInvoiceId(transaction.invoiceId || '');
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    setLoading(true);

    // Regra de futuro força pendente: uma transação com data futura nunca pode
    // ficar completed/cancelled indevidamente. Só forçamos na direção
    // "data futura -> pending"; nunca sobrepõe uma escolha explícita de status
    // quando a data não é futura.
    const effectiveStatus = isFutureDate(occurredAt) ? 'pending' : status;

    try {
      await updateTransaction(transaction.id, {
        description,
        amount,
        type,
        category_id: categoryId || undefined,
        occurred_at: new Date(occurredAt).toISOString(),
        status: effectiveStatus,
        person_id: type === 'expense' ? (personId || null) : null,
        invoice_id: isCreditWallet && invoiceId ? invoiceId : undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao atualizar transação'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus: 'pending' | 'completed' | 'cancelled') => {
    if (!transaction || newStatus === status) return;
    if (
      newStatus === 'cancelled' &&
      !window.confirm('Cancelar esta transação? Se ela já estava concluída, o saldo da carteira volta ao que era antes.')
    ) {
      return;
    }

    setChangingStatus(true);
    try {
      await updateTransaction(transaction.id, {
        description: transaction.description,
        amount: Number(transaction.amount),
        type: transaction.type === 'transfer' ? undefined : transaction.type,
        category_id: transaction.categoryId || undefined,
        occurred_at: transaction.occurredAt,
        status: newStatus,
      });
      setStatus(newStatus);
      onSuccess();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao alterar status da transação'), 'error');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction || !window.confirm('Tem certeza que deseja excluir esta transação?')) return;
    setDeleting(true);

    try {
      await deleteTransaction(transaction.id);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao deletar transação'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !transaction) return null;

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
        className="relative w-full max-w-xl bg-app-surface border border-app-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">Editar Transação</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 hover:bg-app-danger/10 rounded-xl transition-colors text-app-danger disabled:opacity-50"
              title="Excluir Transação"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">Status</label>
            <div className="flex p-1 bg-app-surface-2 border border-app-border rounded-2xl">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={changingStatus || deleting}
                  onClick={() => handleChangeStatus(option.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                    status === option.value
                      ? option.value === 'cancelled'
                        ? 'bg-app-danger text-app-ink shadow-lg'
                        : option.value === 'completed'
                          ? 'bg-app-success text-app-ink shadow-lg'
                          : 'bg-amber-400 text-app-ink shadow-lg'
                      : 'text-app-muted hover:bg-app-surface'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Transação */}
          {transaction.type !== 'transfer' && (
            <div className="flex p-1 bg-app-surface-2 border border-app-border rounded-2xl">
              <button
                type="button"
                onClick={() => { setType('income'); setPersonId(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  type === 'income' ? 'bg-app-success text-app-ink shadow-lg shadow-app-success/20' : 'text-app-muted'
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  type === 'expense' ? 'bg-app-danger text-app-ink shadow-lg shadow-app-danger/20' : 'text-app-muted'
                }`}
              >
                <ArrowDownCircle className="w-5 h-5" />
                Despesa
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted font-bold">R$</span>
                <CurrencyInput
                  required
                  value={amount}
                  onChange={setAmount}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all text-xl ledger-figure"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <input
                  type="date"
                  required
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
              {isFutureDate(occurredAt) && transaction.status !== 'pending' && (
                <p className="text-xs text-app-muted ml-1">Data futura — a transação fica pendente até a data chegar.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">Descrição</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Supermercado..."
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Carteira</label>
              <div className="relative">
                <WalletIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <p className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink">
                  {wallets.find((wallet) => wallet.id === walletId)?.name || '—'}
                </p>
              </div>
              <p className="text-xs text-app-muted ml-1">Para mover uma transação para outra carteira, exclua e recrie.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Categoria</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" className="bg-app-surface">Sem categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-app-surface">{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isCreditWallet && invoices.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Fatura</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  {invoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id} className="bg-app-surface">
                      {invoice.referenceMonth}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-app-muted ml-1">Move a transação para outra fatura sem alterar a data do lançamento.</p>
            </div>
          )}

          {type === 'expense' && people.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Gasto de outra pessoa (opcional)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" className="bg-app-surface">Foi você quem gastou</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id} className="bg-app-surface">{person.name}</option>
                  ))}
                </select>
              </div>
              {personId && (
                <p className="text-xs text-app-muted ml-1">Esse valor vai somar em "ela me deve" na aba Pessoas.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || deleting}
            className="w-full bg-app-accent hover:opacity-90 text-app-ink font-bold py-4 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-app-accent/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
