import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Save, User, DollarSign, Landmark, MapPin, Calendar, Repeat } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { usePeople, type PixKeyType, type PaymentFrequency } from '../hooks/usePeople';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

interface CreatePersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePersonModal = ({ isOpen, onClose, onSuccess }: CreatePersonModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { createPerson } = usePeople();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const [name, setName] = useState('');
  const [theyOweMe, setTheyOweMe] = useState('');
  const [iOweThem, setIOweThem] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('ONE_TIME');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('EMAIL');
  const [pixKey, setPixKey] = useState('');
  const [pixCity, setPixCity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const PIX_KEY_TYPES: { value: PixKeyType; label: string }[] = [
    { value: 'CPF', label: t('people.form.pixTypeCpf') },
    { value: 'CNPJ', label: t('people.form.pixTypeCnpj') },
    { value: 'EMAIL', label: t('people.form.pixTypeEmail') },
    { value: 'PHONE', label: t('people.form.pixTypePhone') },
    { value: 'RANDOM', label: t('people.form.pixTypeRandom') },
  ];

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName('');
      setTheyOweMe('');
      setIOweThem('');
      setPaymentFrequency('ONE_TIME');
      setPixKeyType('EMAIL');
      setPixKey('');
      setPixCity('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createPerson({
        name,
        they_owe_me: theyOweMe ? Number(theyOweMe) : undefined,
        i_owe_them: iOweThem ? Number(iOweThem) : undefined,
        payment_frequency: paymentFrequency,
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        pix_city: pixCity || undefined,
        notes: notes || undefined,
        scope,
        organization_id: scope === 'business' ? (activeOrganizationId ?? undefined) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('people.errors.create')), 'error');
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
        className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">{t('people.form.createTitle')}</h2>
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
                placeholder={t('people.form.namePlaceholder')}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.theyOweMeOptional')}</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={theyOweMe}
                  onChange={(e) => setTheyOweMe(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.iOweThemOptional')}</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={iOweThem}
                  onChange={(e) => setIOweThem(e.target.value)}
                  placeholder="0,00"
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
                  placeholder={t('people.form.pixKeyPlaceholder')}
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
                placeholder={t('people.form.pixCityPlaceholder')}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('people.form.notesLabel')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('people.form.notesPlaceholder')}
              className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all h-20"
            />
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
                {t('people.form.save')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
