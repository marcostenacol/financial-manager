import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Save, Wallet as WalletIcon, CreditCard, Banknote, Landmark, Coins, Trash2 } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useWallets } from '../hooks/useWallets';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

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
  { id: 'checking', labelKey: 'wallets.types.checking', icon: <Landmark className="w-5 h-5" /> },
  { id: 'savings', labelKey: 'wallets.types.savings', icon: <Banknote className="w-5 h-5" /> },
  { id: 'credit', labelKey: 'wallets.types.credit', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'investment', labelKey: 'wallets.types.investment', icon: <WalletIcon className="w-5 h-5" /> },
  { id: 'cash', labelKey: 'wallets.types.cashShort', icon: <Coins className="w-5 h-5" /> },
];

export const UpdateWalletModal = ({ isOpen, onClose, onSuccess, wallet }: UpdateWalletModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { updateWallet, deleteWallet } = useWallets();
  const [name, setName] = useState('');
  const [type, setType] = useState<'checking' | 'savings' | 'credit' | 'investment' | 'cash'>('checking');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && wallet) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(wallet.name);
      setType(wallet.type);
      setBalance(Number(wallet.balance));
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
        balance,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('wallets.toast.updateError')), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!wallet || !window.confirm(t('wallets.confirmDelete'))) return;
    setDeleting(true);

    try {
      await deleteWallet(wallet.id);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('wallets.toast.deleteError')), 'error');
      alert(t('wallets.deleteBlocked'));
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
          className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="p-6 border-b border-app-border flex justify-between items-center">
            <h2 className="text-xl font-bold text-app-ink">{t('wallets.form.editTitle')}</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('wallets.form.nameLabel')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('wallets.form.namePlaceholderUpdate')}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('wallets.form.typeLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                {WALLET_TYPES.map((wType) => (
                  <button
                    key={wType.id}
                    type="button"
                    onClick={() => setType(wType.id as 'checking' | 'savings' | 'credit' | 'investment' | 'cash')}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      type === wType.id 
                        ? 'bg-app-accent/10 border-app-accent text-app-ink shadow-lg shadow-app-card' 
                        : 'bg-app-surface-2 border-app-border text-app-muted hover:bg-app-surface-2'
                    }`}
                  >
                    {wType.icon}
                    <span className="text-xs font-bold">{t(wType.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('wallets.form.currentBalance')}</label>
              <CurrencyInput
                required
                allowNegative
                value={balance}
                onChange={setBalance}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all text-2xl font-bold"
              />
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
                  {t('wallets.form.updateSubmit')}
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
