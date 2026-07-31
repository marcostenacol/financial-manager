import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Wallet, History, LogOut, Tag, RefreshCw, Target, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wallet, label: 'Carteiras', path: '/wallets' },
    { icon: History, label: 'Transações', path: '/transactions' },
    { icon: Tag, label: 'Categorias', path: '/categories' },
    { icon: Target, label: 'Metas', path: '/savings-goals' },
    { icon: RefreshCw, label: 'Recorrências', path: '/recurrences' },
    { icon: UserCircle, label: 'Meu Perfil', path: '/profile' },
  ];

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 flex items-center justify-center bg-app-surface border border-app-border rounded-xl shadow-app-card text-app-ink"
        aria-label="Abrir menu"
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
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto min-h-0 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-app-ink font-bold text-xl">F</span>
          </div>
          <span className="text-app-ink font-bold text-lg tracking-tight">Financial.</span>
        </div>

        <nav className="space-y-2">
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
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full shrink-0"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-6 border-t border-app-border">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-app-accent-soft border border-app-accent/20 flex items-center justify-center text-app-accent font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-app-ink font-medium text-sm truncate">{user?.name}</span>
            <span className="text-app-muted text-xs truncate">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-app-muted hover:text-app-danger hover:bg-app-danger/5 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
      </aside>
    </>
  );
};
