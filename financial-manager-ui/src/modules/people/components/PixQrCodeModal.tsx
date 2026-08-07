import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { usePeople, type Person, type PersonPixQrCode } from '../hooks/usePeople';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

interface PixQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
}

export const PixQrCodeModal = ({ isOpen, onClose, person }: PixQrCodeModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { getPersonPixQrCode } = usePeople();
  const [qrCode, setQrCode] = useState<PersonPixQrCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && person) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      setQrCode(null);
      getPersonPixQrCode(person.id)
        .then(setQrCode)
        .catch((err) => showToast(getErrorMessage(err, t('people.errors.qrCode')), 'error'))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, person]);

  if (!isOpen || !person) return null;

  const handleCopy = async () => {
    if (!qrCode) return;
    await navigator.clipboard.writeText(qrCode.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h2 className="text-xl font-bold text-app-ink">{t('people.pix.titlePrefix', { name: person.name })}</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
          <p className="ledger-figure text-3xl text-app-ink">
            {Number(person.iOweThem).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>

          <div className="w-56 h-56 flex items-center justify-center bg-white rounded-2xl border border-app-border overflow-hidden">
            {loading ? (
              <div className="w-10 h-10 border-4 border-app-accent/30 border-t-app-accent rounded-full animate-spin" />
            ) : qrCode ? (
              <img src={qrCode.qrCodeDataUrl} alt="QR Code PIX" className="w-full h-full object-contain" />
            ) : (
              <span className="text-sm text-app-muted px-4 text-center">{t('people.pix.genericError')}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!qrCode}
            className="w-full bg-app-accent hover:opacity-90 text-app-ink font-bold py-4 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? t('people.pix.copied') : t('people.pix.copy')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
