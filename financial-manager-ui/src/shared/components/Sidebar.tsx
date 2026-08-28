import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, UserCircle, Wallet, History, LogOut, Tag, RefreshCw, Target, Menu, X, Briefcase, User, Building2, Sun, Moon, Languages, Users, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { useScope } from '../../contexts/useScope';
import { getAvatarUrl } from '../lib/getAvatarUrl';
import { useTheme } from '../../hooks/useTheme';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { scope, setScope } = useScope();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
    { icon: Wallet, label: t('nav.wallets'), path: '/wallets' },
    { icon: CreditCard, label: 'Cartões', path: '/credit-cards' },
    { icon: History, label: t('nav.transactions'), path: '/transactions' },
    { icon: Tag, label: t('nav.categories'), path: '/categories' },
    ...(scope === 'personal' ? [{ icon: Target, label: t('nav.savingsGoals'), path: '/savings-goals' }] : []),
    ...(scope === 'business' ? [{ icon: Briefcase, label: t('nav.costCenters'), path: '/cost-centers' }] : []),
    { icon: RefreshCw, label: t('nav.recurrences'), path: '/recurrences' },
    { icon: Users, label: t('nav.people'), path: '/people' },
    { icon: Building2, label: t('nav.organizations'), path: '/organizations' },
    { icon: UserCircle, label: t('nav.profile'), path: '/profile' },
  ];

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 flex items-center justify-center bg-app-surface border border-app-border rounded-xl shadow-app-card text-app-ink"
        aria-label={t('common.openMenu')}
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}

      <aside
        className={`w-64 bg-app-surface backdrop-blur-xl border border-app-border rounded-2xl shadow-app-card flex flex-col h-[calc(100vh-2rem)] fixed md:sticky top-4 left-4 md:left-auto z-50 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)] md:translate-x-0'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-app-muted hover:text-app-ink"
          aria-label={t('common.closeMenu')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto min-h-0 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-app-card shrink-0">
            <img src="/favicon.svg?v=2" alt="Croesus" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="ledger-title text-app-ink text-xl leading-none">Croesus</span>
            <span className="text-[9px] uppercase tracking-[0.22em] text-app-muted mt-1">{t('shared.sidebar.ledgerSubtitle')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-app-surface-2 rounded-2xl border border-app-border">
          <button
            onClick={() => setScope('personal')}
            className={`flex items-center justify-center gap-1 px-1 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${
              scope === 'personal' ? 'bg-app-accent text-app-accent-ink shadow-app-card' : 'text-app-muted hover:text-app-ink'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('nav.personal')}</span>
          </button>
          <button
            onClick={() => setScope('business')}
            className={`flex items-center justify-center gap-1 px-1 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${
              scope === 'business' ? 'bg-app-accent text-app-accent-ink shadow-app-card' : 'text-app-muted hover:text-app-ink'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('nav.business')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-app-muted">{t('shared.sidebar.entriesSection')}</span>
          <span className="flex-1 h-px bg-app-border" />
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-app-accent text-app-accent-ink shadow-app-card'
                    : 'text-app-muted hover:bg-app-surface-2 hover:text-app-ink'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-app-accent-ink' : 'text-app-muted group-hover:text-app-accent'}`} />
                <span className="font-medium truncate">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 bg-app-ink rounded-full shrink-0"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-6 border-t border-app-border">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-app-accent-soft border border-app-accent/20 flex items-center justify-center text-app-accent font-bold overflow-hidden shrink-0">
            {getAvatarUrl(user?.avatar) ? (
              <img src={getAvatarUrl(user?.avatar)!} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-app-ink font-medium text-sm truncate">{user?.name}</span>
            <span className="text-app-muted text-xs truncate">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 text-app-muted hover:text-app-ink hover:bg-app-surface-2 rounded-xl transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="font-medium">{theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 w-full px-4 py-3 text-app-muted hover:text-app-ink hover:bg-app-surface-2 rounded-xl transition-all"
          >
            <Languages className="w-5 h-5" />
            <span className="font-medium uppercase">{i18n.resolvedLanguage}</span>
          </button>
          {langMenuOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-app-surface border border-app-border rounded-xl shadow-app-card overflow-hidden">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { i18n.changeLanguage(lang); setLangMenuOpen(false); }}
                  className={`flex items-center w-full px-4 py-2 text-sm uppercase font-medium transition-all ${
                    i18n.resolvedLanguage === lang ? 'text-app-accent' : 'text-app-muted hover:text-app-ink hover:bg-app-surface-2'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-app-muted hover:text-app-danger hover:bg-app-danger/5 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('nav.signOut')}</span>
        </button>
      </div>
      </aside>
    </>
  );
};
