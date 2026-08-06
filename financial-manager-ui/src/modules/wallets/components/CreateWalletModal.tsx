import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Save, Wallet as WalletIcon, CreditCard, Banknote, Landmark, Coins } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useWallets } from '../hooks/useWallets';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WALLET_TYPES = [
  { id: 'checking', labelKey: 'wallets.types.checking', icon: WalletIcon, color: 'text-app-accent' },
  { id: 'savings', labelKey: 'wallets.types.savings', icon: Banknote, color: 'text-emerald-400' },
  { id: 'credit', labelKey: 'wallets.types.credit', icon: CreditCard, color: 'text-app-accent' },
  { id: 'investment', labelKey: 'wallets.types.investment', icon: Landmark, color: 'text-amber-400' },
  { id: 'cash', labelKey: 'wallets.types.cash', icon: Coins, color: 'text-orange-400' },
];

export const CreateWalletModal = ({ isOpen, onClose, onSuccess }: CreateWalletModalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { createWallet } = useWallets();
  const { organizations, loadOrganizations } = useOrganizations();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState(0);
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrganizations().catch(() => {});
      // Só pré-seleciona a organização ativa quando o formulário está no escopo empresarial —
      // senão o valor fica "preso" no estado e é enviado no submit mesmo com o seletor de
      // organização escondido (escopo pessoal), criando uma carteira empresarial por engano.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrganizationId(scope === 'business' ? (activeOrganizationId ?? '') : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, scope]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createWallet({
        name,
        type,
        scope,
        balance,
        currency: 'BRL',
        organization_id: scope === 'business' && organizationId ? organizationId : undefined,
      });
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setType('checking');
      setBalance(0);
      setOrganizationId('');
    } catch (err) {
      showToast(getErrorMessage(err, t('wallets.toast.createError')), 'error');
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
        className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">{t('wallets.new')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('wallets.form.nameLabel')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('wallets.form.namePlaceholderCreate')}
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
                  onClick={() => setType(wType.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    type === wType.id 
                      ? 'bg-app-accent/20 border-app-accent text-app-ink' 
                      : 'bg-app-surface-2 border-app-border text-app-muted hover:bg-app-surface-2'
                  }`}
                >
                  <wType.icon className={`w-5 h-5 ${type === wType.id ? wType.color : ''}`} />
                  <span className="text-sm font-medium">{t(wType.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {scope === 'business' && organizations.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">{t('wallets.organization')}</label>
              <select
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
              >
                <option value="" className="bg-app-surface">{t('wallets.form.onlyMine')}</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id} className="bg-app-surface">{organization.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">{t('wallets.form.initialBalance')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted font-bold text-lg">R$</span>
              <CurrencyInput
                required
                value={balance}
                onChange={setBalance}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all text-xl ledger-figure"
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
                {t('wallets.form.createSubmit')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
