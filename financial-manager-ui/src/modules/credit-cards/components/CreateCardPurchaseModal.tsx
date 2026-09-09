import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, Save, FileText, Tag, Calendar, User, Layers } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useCategories, type Category } from '../../categories/hooks/useCategories';
import { usePeople, type Person } from '../../people/hooks/usePeople';
import { useScope } from '../../../contexts/useScope';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { isFutureDate } from '../../../shared/lib/isFutureDate';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';
import type { CreditCard } from '../hooks/useCreditCards';

interface CreateCardPurchaseModalProps {
  isOpen: boolean;
  card: CreditCard | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCardPurchaseModal = ({ isOpen, card, onClose, onSuccess }: CreateCardPurchaseModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { createTransaction } = useTransactions();
  const { scope } = useScope();
  const { loadCategories } = useCategories(scope);
  const { loadPeople } = usePeople(scope);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setDescription('');
    setAmount(0);
    setPersonId('');
    setOccurredAt(new Date().toISOString().split('T')[0]);
    setInstallments(1);
  };

  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const [categoriesData, peopleData] = await Promise.all([loadCategories(), loadPeople()]);
        const expenseCategories = categoriesData.filter((c) => c.type === 'expense' || c.type === 'both');
        setCategories(expenseCategories);
        setPeople(peopleData);
        if (expenseCategories.length > 0) setCategoryId(expenseCategories[0].id);
      } catch (err) {
        showToast(getErrorMessage(err, t('creditCards.errors.loadPurchaseData')), 'error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    setLoading(true);

    try {
      await createTransaction({
        description,
        amount,
        type: 'expense',
        wallet_id: card.id,
        category_id: categoryId,
        occurred_at: new Date(occurredAt).toISOString(),
        status: isFutureDate(occurredAt) ? 'pending' : 'completed',
        person_id: personId || undefined,
        installments: installments > 1 ? installments : undefined,
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      showToast(getErrorMessage(err, t('creditCards.errors.createPurchase')), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !card) return null;

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
          <div>
            <h2 className="text-xl font-bold text-app-ink">{t('creditCards.form.title')}</h2>
            <p className="text-sm text-app-muted">{card.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('creditCards.form.amountLabel')}</label>
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
              <label className="text-sm font-medium text-app-muted ml-1">{t('creditCards.form.dateLabel')}</label>
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
              {isFutureDate(occurredAt) && (
                <p className="text-xs text-app-muted ml-1">{t('creditCards.form.futureDateHint')}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('creditCards.form.descriptionLabel')}</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('creditCards.form.descriptionPlaceholder')}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('creditCards.form.categoryLabel')}</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-app-surface">{t('creditCards.form.selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-app-surface">{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('creditCards.form.installmentsLabel')}</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={installments}
                  onChange={(e) => setInstallments(Math.min(60, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
              {installments > 1 && (
                <p className="text-xs text-app-muted ml-1">
                  {t('creditCards.form.installmentsHint', {
                    count: installments,
                    amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / installments),
                  })}
                </p>
              )}
            </div>
          </div>

          {people.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('creditCards.form.personLabel')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
                >
                  <option value="" className="bg-app-surface">{t('creditCards.form.selfSpent')}</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id} className="bg-app-surface">{person.name}</option>
                  ))}
                </select>
              </div>
              {personId && (
                <p className="text-xs text-app-muted ml-1">{t('creditCards.form.personDebtHint')}</p>
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
                {t('creditCards.form.submit')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
