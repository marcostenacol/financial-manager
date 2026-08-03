import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, ArrowUpCircle, ArrowDownCircle, Wallet as WalletIcon, Calendar, Tag, FileText } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../../wallets/hooks/useWallets';
import { useCategories } from '../../categories/hooks/useCategories';
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

export interface DuplicateTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  walletId: string;
  categoryId?: string;
}

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: DuplicateTransactionData | null;
}

export const CreateTransactionModal = ({ isOpen, onClose, onSuccess, initialData }: CreateTransactionModalProps) => {
  const { showToast } = useToast();
  const { createTransaction } = useTransactions();
  const { loadWallets } = useWallets();
  const { loadCategories } = useCategories();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().split('T')[0]);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [walletsData, categoriesData] = await Promise.all([
        loadWallets(),
        loadCategories(),
      ]);
      setWallets(walletsData);
      setCategories(categoriesData);

      if (initialData) {
        setType(initialData.type);
        setDescription(initialData.description);
        setAmount(initialData.amount);
        setWalletId(initialData.walletId);
        setCategoryId(initialData.categoryId ?? '');
        setOccurredAt(new Date().toISOString().split('T')[0]);
        return;
      }

      if (walletsData.length > 0) {
        const primaryWallet = walletsData.find((wallet) => wallet.isPrimary);
        setWalletId((primaryWallet ?? walletsData[0]).id);
      }
      if (categoriesData.length > 0) {
        setCategoryId(categoriesData[0].id);
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao carregar dados para transação'), 'error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTransaction({
        description,
        amount,
        type,
        wallet_id: walletId,
        category_id: categoryId,
        occurred_at: new Date(occurredAt).toISOString(),
        status: 'completed', // Por padrão efetivado para simplificar
      });

      onSuccess();
      onClose();
      // Reset
      setDescription('');
      setAmount(0);
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao criar transação'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{initialData ? 'Duplicar Transação' : 'Nova Transação'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Tipo de Transação */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                type === 'income' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400'
              }`}
            >
              <ArrowUpCircle className="w-5 h-5" />
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                type === 'expense' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400'
              }`}
            >
              <ArrowDownCircle className="w-5 h-5" />
              Despesa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                <CurrencyInput
                  required
                  value={amount}
                  onChange={setAmount}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="date"
                  required
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Descrição</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Supermercado..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Carteira</label>
              <div className="relative">
                <WalletIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-slate-900">Selecionar Carteira</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id} className="bg-slate-900">{wallet.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Categoria</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-slate-900">Selecionar categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-slate-900">{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Confirmar Transação
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
