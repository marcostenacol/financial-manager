import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Check, Wallet as WalletIcon, Tag, DollarSign } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { usePeople, type Person, type SettleDirection } from '../hooks/usePeople';
import { useWallets } from '../../wallets/hooks/useWallets';
import { useCategories } from '../../categories/hooks/useCategories';
import { useScope } from '../../../contexts/useScope';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  person: Person | null;
  direction: SettleDirection | null;
}

export const SettleDebtModal = ({ isOpen, onClose, onSuccess, person, direction }: SettleDebtModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { settlePersonDebt } = usePeople();
  const { scope } = useScope();
  const { wallets, loadWallets } = useWallets(scope);
  const { categories, loadCategories } = useCategories(scope);
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [settleAmount, setSettleAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const pendingAmount = person && direction
    ? Number(direction === 'they_owe_me' ? person.theyOweMe : person.iOweThem)
    : 0;

  useEffect(() => {
    if (isOpen) {
      loadWallets().catch(() => {});
      loadCategories().catch(() => {});
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWalletId('');
      setCategoryId('');
      setSettleAmount(pendingAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, person, direction]);

  if (!isOpen || !person || !direction) return null;

  const title = direction === 'they_owe_me' ? t('people.settle.receiveTitle') : t('people.settle.payTitle');
  const remainingAfter = Math.max(0, pendingAmount - settleAmount);
  const isPartial = settleAmount > 0 && settleAmount < pendingAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await settlePersonDebt(person.id, { direction, wallet_id: walletId, category_id: categoryId, amount: settleAmount });
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('people.errors.settle')), 'error');
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
        className="relative w-full max-w-sm bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-app-muted text-sm">
            {person.name} — {t('people.settle.pendingTotal')} <span className="ledger-figure text-app-ink">
              {pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> {t('people.settle.amountLabel')}
            </label>
            <CurrencyInput
              required
              value={settleAmount}
              onChange={setSettleAmount}
              className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 ledger-figure"
            />
            {isPartial && (
              <p className="text-xs text-amber-400 ml-1">
                {t('people.settle.remainingAfter', {
                  amount: remainingAfter.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1 flex items-center gap-2">
              <WalletIcon className="w-4 h-4" /> {t('people.settle.walletLabel')}
            </label>
            <select
              required
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 appearance-none"
            >
              <option value="" className="bg-app-surface">{t('people.settle.selectWallet')}</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id} className="bg-app-surface">{wallet.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1 flex items-center gap-2">
              <Tag className="w-4 h-4" /> {t('people.settle.categoryLabel')}
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 appearance-none"
            >
              <option value="" className="bg-app-surface">{t('people.settle.selectCategory')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-app-surface">{category.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !walletId || !categoryId || settleAmount <= 0 || settleAmount > pendingAmount}
            className="w-full bg-app-accent hover:opacity-90 text-app-ink font-bold py-3.5 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-app-accent/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                {t('people.settle.confirm')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
