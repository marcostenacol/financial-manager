import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet as WalletIcon, ChevronDown } from 'lucide-react';
import type { Wallet } from '../../wallets/hooks/useWallets';

interface WalletFilterSelectProps {
  wallets: Wallet[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const WalletFilterSelect = ({ wallets, selectedIds, onChange }: WalletFilterSelectProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (wallets.length === 0) return null;

  const selectedWallets = wallets.filter((wallet) => selectedIds.includes(wallet.id));
  const buttonLabel = selectedWallets.length === 0
    ? t('dashboard.walletFilter.all')
    : selectedWallets.length === 1
      ? (selectedWallets[0] as Wallet).name
      : t('dashboard.walletFilter.selected', { count: selectedWallets.length });

  const toggleWallet = (walletId: string) => {
    onChange(selectedIds.includes(walletId) ? selectedIds.filter((id) => id !== walletId) : [...selectedIds, walletId]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={t('dashboard.walletFilter.label')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="bg-app-surface border border-app-border rounded-2xl py-3 pl-9 pr-9 text-app-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-app-accent/50 relative"
      >
        <WalletIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted pointer-events-none" />
        {buttonLabel}
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted pointer-events-none" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 min-w-full w-64 bg-app-surface border border-app-border rounded-2xl p-2 shadow-lg">
          <ul className="max-h-64 overflow-y-auto">
            {wallets.map((wallet) => (
              <li key={wallet.id}>
                <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-app-surface-2 cursor-pointer text-sm text-app-ink">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(wallet.id)}
                    onChange={() => toggleWallet(wallet.id)}
                  />
                  <span className="truncate">{wallet.name}</span>
                </label>
              </li>
            ))}
          </ul>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full mt-1 px-3 py-2 text-left text-xs font-bold text-app-muted hover:text-app-ink"
            >
              {t('dashboard.walletFilter.clear')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
