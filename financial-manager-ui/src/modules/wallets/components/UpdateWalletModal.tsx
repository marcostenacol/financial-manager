import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Wallet as WalletIcon, CreditCard, Banknote, Landmark, Coins, Trash2 } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useWallets } from '../hooks/useWallets';

interface Wallet {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
}

interface UpdateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wallet: Wallet | null;
}

const WALLET_TYPES = [
  { id: 'checking', label: 'Conta Corrente', icon: <Landmark className="w-5 h-5" /> },
  { id: 'savings', label: 'Poupança', icon: <Banknote className="w-5 h-5" /> },
  { id: 'credit', label: 'Cartão de Crédito', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'investment', label: 'Investimento', icon: <WalletIcon className="w-5 h-5" /> },
  { id: 'cash', label: 'Dinheiro', icon: <Coins className="w-5 h-5" /> },
];

export const UpdateWalletModal = ({ isOpen, onClose, onSuccess, wallet }: UpdateWalletModalProps) => {
  const { showToast } = useToast();
  const { updateWallet, deleteWallet } = useWallets();
  const [name, setName] = useState('');
  const [type, setType] = useState<'checking' | 'savings' | 'credit' | 'investment' | 'cash'>('checking');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && wallet) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(wallet.name);
      setType(wallet.type);
      setBalance(wallet.balance.toString());
    }
  }, [isOpen, wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setLoading(true);

    try {
      await updateWallet(wallet.id, {
        name,
        type,
        balance: Number(balance),
      });
      
      onSuccess();
      onClose();
    } catch {
      showToast('Erro ao atualizar carteira', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!wallet || !window.confirm('Tem certeza que deseja excluir esta carteira? Todas as transações vinculadas serão afetadas.')) return;
    setDeleting(true);

    try {
      await deleteWallet(wallet.id);
      onSuccess();
      onClose();
    } catch {
      showToast('Erro ao deletar carteira', 'error');
      alert('Não foi possível excluir esta carteira. Verifique se existem transações ativas.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !wallet) return null;

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Editar Carteira</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Nome da Carteira</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank, Carteira Pessoal..."
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
                    onClick={() => setType(wType.id as 'checking' | 'savings' | 'credit' | 'investment' | 'cash')}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      type === wType.id 
                        ? 'bg-blue-600/10 border-blue-600 text-white shadow-lg shadow-blue-600/5' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {wType.icon}
                    <span className="text-xs font-bold">{wType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Saldo Atual (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0,00"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-2xl font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading || deleting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    </AnimatePresence>
  );
};
