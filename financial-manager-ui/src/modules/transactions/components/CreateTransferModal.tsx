import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, AlertCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';
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
  balance: number;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
}

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTransferModal: React.FC<CreateTransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const { transfer } = useTransactions();
  const { scope } = useScope();
  const { loadWallets } = useWallets(scope);
  const { loadCategories } = useCategories(scope);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [sourceWalletId, setSourceWalletId] = useState('');
  const [destinationWalletId, setDestinationWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const loadData = async () => {
    try {
      const [walletsData, categoriesData] = await Promise.all([
        loadWallets(),
        loadCategories(),
      ]);
      setWallets(walletsData);
      setCategories(categoriesData.filter((c: Category) => c.type === 'both' || c.type === 'expense'));
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao carregar dados para transferência'), 'error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await transfer({
        description,
        amount,
        source_wallet_id: sourceWalletId,
        destination_wallet_id: destinationWalletId,
        category_id: categoryId,
      });

      onSuccess();
      onClose();
      // Reset form
      setDescription('');
      setAmount(0);
      setSourceWalletId('');
      setDestinationWalletId('');
      setCategoryId('');
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || 'Erro ao realizar transferência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-[#1e293b] border border-app-border rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="p-8 border-b border-app-border flex justify-between items-center bg-gradient-to-r from-app-accent/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-app-accent rounded-2xl text-app-ink shadow-lg shadow-app-card">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-app-ink">Transferência</h2>
                  <p className="text-app-muted text-sm">Mova saldo entre suas contas</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-app-muted ml-1">Origem</label>
                  <div className="relative">
                    <select
                      required
                      value={sourceWalletId}
                      onChange={(e) => setSourceWalletId(e.target.value)}
                      className="w-full bg-app-surface-2 border border-app-border rounded-2xl px-4 py-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 appearance-none transition-all"
                    >
                      <option value="" className="bg-app-surface">Selecionar origem</option>
                      {wallets.map(w => (
                        <option key={w.id} value={w.id} className="bg-app-surface">
                          {w.name} (R$ {w.balance})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-app-muted ml-1">Destino</label>
                  <div className="relative">
                    <select
                      required
                      value={destinationWalletId}
                      onChange={(e) => setDestinationWalletId(e.target.value)}
                      className="w-full bg-app-surface-2 border border-app-border rounded-2xl px-4 py-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 appearance-none transition-all"
                    >
                      <option value="" className="bg-app-surface">Selecionar destino</option>
                      {wallets.filter(w => w.id !== sourceWalletId).map(w => (
                        <option key={w.id} value={w.id} className="bg-app-surface">
                          {w.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-app-muted ml-1">Valor (R$)</label>
                  <CurrencyInput
                    required
                    value={amount}
                    onChange={setAmount}
                    className="w-full bg-app-surface-2 border border-app-border rounded-2xl px-4 py-4 text-app-ink placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all text-xl font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-app-muted ml-1">Categoria de Registro</label>
                  <div className="relative">
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-app-surface-2 border border-app-border rounded-2xl px-4 py-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 appearance-none transition-all"
                    >
                      <option value="" className="bg-app-surface">Selecionar categoria</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id} className="bg-app-surface">{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-app-muted ml-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Transferência para reserva"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl px-4 py-4 text-app-ink placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-app-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-app-ink py-4 rounded-2xl font-bold text-lg shadow-xl shadow-app-card transition-all active:scale-[0.98] mt-4"
              >
                {loading ? 'Processando...' : 'Confirmar Transferência'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
