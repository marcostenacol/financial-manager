import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, ArrowUpCircle, ArrowDownCircle, Wallet as WalletIcon, Calendar, Tag, FileText, Trash2 } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../../wallets/hooks/useWallets';
import { useCategories } from '../../categories/hooks/useCategories';
import { useScope } from '../../../contexts/useScope';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface Wallet {
  id: string;
  name: string;
}

interface Category {
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
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [walletsData, categoriesData] = await Promise.all([
        loadWallets(),
        loadCategories(),
      ]);
      setWallets(walletsData);
      setCategories(categoriesData);
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
      setOccurredAt(new Date(transaction.occurredAt).toISOString().split('T')[0]);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    setLoading(true);

    try {
      await updateTransaction(transaction.id, {
        description,
        amount,
        type,
        category_id: categoryId || undefined,
        occurred_at: new Date(occurredAt).toISOString(),
        status: transaction.status,
      });

      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao atualizar transação'), 'error');
    } finally {
      setLoading(false);
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
        className="relative w-full max-w-xl bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">Editar Transação</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 disabled:opacity-50"
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
          {/* Tipo de Transação */}
          {transaction.type !== 'transfer' && (
            <div className="flex p-1 bg-app-surface-2 border border-app-border rounded-2xl">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  type === 'income' ? 'bg-emerald-600 text-app-ink shadow-lg shadow-emerald-600/20' : 'text-app-muted'
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  type === 'expense' ? 'bg-red-600 text-app-ink shadow-lg shadow-red-600/20' : 'text-app-muted'
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
                <select
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-app-surface">Selecionar Carteira</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id} className="bg-app-surface">{wallet.name}</option>
                  ))}
                </select>
              </div>
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
