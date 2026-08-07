import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Save, User, DollarSign, Landmark, MapPin, Calendar, Repeat, Trash2 } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { usePeople, type Person, type PixKeyType, type PaymentFrequency } from '../hooks/usePeople';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

interface UpdatePersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  person: Person | null;
}

export const UpdatePersonModal = ({ isOpen, onClose, onSuccess, person }: UpdatePersonModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { updatePerson, deletePerson } = usePeople();
  const [name, setName] = useState('');
  const [theyOweMe, setTheyOweMe] = useState('');
  const [iOweThem, setIOweThem] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('ONE_TIME');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('EMAIL');
  const [pixKey, setPixKey] = useState('');
  const [pixCity, setPixCity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
    { value: 'CPF', label: t('people.form.pixTypeCpf') },
    { value: 'CNPJ', label: t('people.form.pixTypeCnpj') },
    { value: 'EMAIL', label: t('people.form.pixTypeEmail') },
    { value: 'PHONE', label: t('people.form.pixTypePhone') },
    { value: 'RANDOM', label: t('people.form.pixTypeRandom') },
  ];

  useEffect(() => {
    if (isOpen && person) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(person.name);
      setTheyOweMe(String(Number(person.theyOweMe)));
      setIOweThem(String(Number(person.iOweThem)));
      setPaymentFrequency(person.paymentFrequency);
      setPixKeyType(person.pixKeyType);
      setPixKey(person.pixKey);
      setPixCity(person.pixCity ?? '');
      setNotes(person.notes ?? '');
    }
  }, [isOpen, person]);

  if (!isOpen || !person) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePerson(person.id, {
        name,
        they_owe_me: theyOweMe ? Number(theyOweMe) : 0,
        i_owe_them: iOweThem ? Number(iOweThem) : 0,
        payment_frequency: paymentFrequency,
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        pix_city: pixCity || undefined,
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('people.errors.update')), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('people.confirmDelete', { name: person.name }))) return;
    setDeleting(true);

    try {
      await deletePerson(person.id);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('people.errors.delete')), 'error');
    } finally {
      setDeleting(false);
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
        className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">{t('people.form.editTitle')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.nameLabel')}</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.theyOweMe')}</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={theyOweMe}
                  onChange={(e) => setTheyOweMe(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.iOweThem')}</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={iOweThem}
                  onChange={(e) => setIOweThem(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.frequencyLabel')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentFrequency('ONE_TIME')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  paymentFrequency === 'ONE_TIME' ? 'bg-app-accent/20 border-app-accent text-app-ink' : 'bg-app-surface-2 border-app-border text-app-muted'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">{t('people.form.frequencyOneTimeOption')}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentFrequency('MONTHLY')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  paymentFrequency === 'MONTHLY' ? 'bg-app-accent/20 border-app-accent text-app-ink' : 'bg-app-surface-2 border-app-border text-app-muted'
                }`}
              >
                <Repeat className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">{t('people.form.frequencyMonthlyOption')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.pixKeyTypeLabel')}</label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
              >
                {PIX_KEY_TYPES.map((option) => (
                  <option key={option.value} value={option.value} className="bg-app-surface">{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.pixKeyLabel')}</label>
              <div className="relative group">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.pixCityLabel')}</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
              <input
                type="text"
                value={pixCity}
                onChange={(e) => setPixCity(e.target.value)}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.notesLabel')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all h-20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-4 rounded-2xl border border-app-border text-app-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-app-accent hover:opacity-90 text-app-ink font-bold py-4 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-app-accent/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t('people.form.saveChanges')}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
