import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Save, RefreshCw, Clock, Tag, FileText, Calendar } from 'lucide-react';
import { useCategories } from '../../categories/hooks/useCategories';
import { useRecurrences, type Recurrence } from '../hooks/useRecurrences';
import { useScope } from '../../../contexts/useScope';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface UpdateRecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recurrence: Recurrence | null;
}

export const UpdateRecurrenceModal = ({ isOpen, onClose, onSuccess, recurrence }: UpdateRecurrenceModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { scope } = useScope();
  const { categories, loadCategories } = useCategories(scope);
  const { updateRecurrence } = useRecurrences();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [endsAt, setEndsAt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && recurrence) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDescription(recurrence.description);
      setAmount(Number(recurrence.amount));
      setType(recurrence.type);
      setPeriod(recurrence.period);
      setEndsAt(recurrence.endsAt ? recurrence.endsAt.split('T')[0] : '');
      loadCategories().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, recurrence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurrence) return;
    setLoading(true);

    try {
      await updateRecurrence(recurrence.id, {
        description,
        amount,
        type,
        ...(categoryId && { category_id: categoryId }),
        period,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('recurrences.errors.update')), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !recurrence) return null;

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
            {t('recurrences.edit')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
              <label className="text-sm font-medium text-app-muted ml-1">{t('common.category')}</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" className="bg-app-surface">{t('recurrences.form.keepCategory')}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-app-surface">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('recurrences.form.endDate')}</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
              <input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
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
                {t('recurrences.form.saveChanges')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
