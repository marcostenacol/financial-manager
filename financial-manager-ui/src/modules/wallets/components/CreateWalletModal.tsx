import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Wallet as WalletIcon, CreditCard, Banknote, Landmark, Coins } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useWallets } from '../hooks/useWallets';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WALLET_TYPES = [
  { id: 'checking', label: 'Conta Corrente', icon: WalletIcon, color: 'text-blue-400' },
  { id: 'savings', label: 'Poupança', icon: Banknote, color: 'text-emerald-400' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, color: 'text-purple-400' },
  { id: 'investment', label: 'Investimento', icon: Landmark, color: 'text-amber-400' },
  { id: 'cash', label: 'Dinheiro em Espécie', icon: Coins, color: 'text-orange-400' },
];

export const CreateWalletModal = ({ isOpen, onClose, onSuccess }: CreateWalletModalProps) => {
  const { showToast } = useToast();
  const { createWallet } = useWallets();
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createWallet({
        name,
        type,
        balance: Number(balance),
        currency: 'BRL',
      });
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setType('checking');
      setBalance('');
    } catch {
      showToast('Erro ao criar carteira', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Nova Carteira</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Nome da Carteira</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank Principal"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Tipo de Conta</label>
            <div className="grid grid-cols-2 gap-3">
              {WALLET_TYPES.map((wType) => (
                <button
                  key={wType.id}
                  type="button"
                  onClick={() => setType(wType.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    type === wType.id 
                      ? 'bg-blue-600/20 border-blue-600 text-white' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <wType.icon className={`w-5 h-5 ${type === wType.id ? wType.color : ''}`} />
                  <span className="text-sm font-medium">{wType.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Saldo Inicial</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">R$</span>
              <input
                type="number"
                step="0.01"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0,00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-xl font-mono"
              />
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
                Criar Carteira
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
