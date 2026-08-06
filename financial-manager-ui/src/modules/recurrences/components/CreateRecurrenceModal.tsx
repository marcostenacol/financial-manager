import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Save, RefreshCw, Calendar, Wallet as WalletIcon, Tag, Clock, FileText } from 'lucide-react';
import { useWallets } from '../../wallets/hooks/useWallets';
import { useCategories } from '../../categories/hooks/useCategories';
import { useRecurrences } from '../hooks/useRecurrences';
import { useScope } from '../../../contexts/useScope';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface CreateRecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRecurrenceModal = ({ isOpen, onClose, onSuccess }: CreateRecurrenceModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { scope } = useScope();
  const { wallets, loadWallets } = useWallets(scope);
  const { categories, loadCategories } = useCategories(scope);
  const { createRecurrence, runRecurrenceNow } = useRecurrences();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [loadedWallets, loadedCategories] = await Promise.all([loadWallets(), loadCategories()]);

      if (loadedWallets.length > 0) setWalletId(loadedWallets[0].id);
      if (loadedCategories.length > 0) setCategoryId(loadedCategories[0].id);
    } catch (err) {
      showToast(getErrorMessage(err, t('recurrences.errors.loadData')), 'error');
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

    try {
      const recurrence = await createRecurrence({
        description,
        amount,
        type,
        wallet_id: walletId,
        category_id: categoryId,
        period,
        starts_at: new Date(startsAt).toISOString(),
      });

      onSuccess();
      onClose();

      if (window.confirm(t('recurrences.confirmRunAfterCreate'))) {
        try {
          await runRecurrenceNow(recurrence.id);
          showToast(t('recurrences.runNowSuccess'), 'success');
          onSuccess();
        } catch (err) {
          showToast(getErrorMessage(err, t('recurrences.errors.runNow')), 'error');
        }
      }
    } catch (err) {
      showToast(getErrorMessage(err, t('recurrences.errors.create')), 'error');
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
        className="relative w-full max-w-2xl bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center bg-app-surface sticky top-0 z-10">
          <h2 className="text-xl font-bold text-app-ink flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-app-accent" />
            {t('recurrences.new')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Tipo de Recorrência */}
          <div className="flex p-1 bg-app-surface-2 border border-app-border rounded-2xl">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                type === 'income' ? 'bg-emerald-600 text-app-ink shadow-lg shadow-emerald-600/20' : 'text-app-muted'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              {t('common.income')}
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                type === 'expense' ? 'bg-red-600 text-app-ink shadow-lg shadow-red-600/20' : 'text-app-muted'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              {t('common.expense')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('common.description')}</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('recurrences.form.descriptionPlaceholder')}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('common.value')}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted font-bold">R$</span>
                <CurrencyInput
                  required
                  value={amount}
                  onChange={setAmount}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all ledger-figure"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('recurrences.form.frequency')}</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="daily" className="bg-app-surface">{t('recurrences.period.daily')}</option>
                  <option value="weekly" className="bg-app-surface">{t('recurrences.period.weekly')}</option>
                  <option value="monthly" className="bg-app-surface">{t('recurrences.period.monthly')}</option>
                  <option value="yearly" className="bg-app-surface">{t('recurrences.period.yearly')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('recurrences.form.startDate')}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <input
                  type="date"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('common.wallet')}</label>
              <div className="relative">
                <WalletIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-app-surface">{t('recurrences.form.selectWallet')}</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id} className="bg-app-surface">{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('common.category')}</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-app-surface">{t('recurrences.form.selectCategory')}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-app-surface">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
                {t('recurrences.form.submit')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
