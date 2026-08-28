import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, ArrowUpCircle, ArrowDownCircle, Wallet as WalletIcon, Calendar, Tag, FileText, User } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../../wallets/hooks/useWallets';
import { useCategories } from '../../categories/hooks/useCategories';
import { usePeople } from '../../people/hooks/usePeople';
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

interface Person {
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
  const { scope } = useScope();
  const { loadWallets } = useWallets(scope);
  const { loadCategories } = useCategories(scope);
  const { loadPeople } = usePeople(scope);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().split('T')[0]);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

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
      setPersonId('');
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
        person_id: type === 'expense' && personId ? personId : undefined,
      });

      onSuccess();
      onClose();
      // Reset
      setDescription('');
      setAmount(0);
      setPersonId('');
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
        className="relative w-full max-w-xl bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">{initialData ? 'Duplicar Transação' : 'Nova Transação'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Tipo de Transação */}
          <div className="flex p-1 bg-app-surface-2 border border-app-border rounded-2xl">
            <button
              type="button"
              onClick={() => { setType('income'); setPersonId(''); }}
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
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-app-surface">Selecionar categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-app-surface">{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
            disabled={loading}
            className="w-full bg-app-accent hover:opacity-90 text-app-ink font-bold py-4 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-app-accent/40 border-t-white rounded-full animate-spin" />
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
