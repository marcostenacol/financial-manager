import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Wallet, History, LogOut, Tag, RefreshCw, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

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
    <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Financial.</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-medium text-sm truncate">{user?.name}</span>
            <span className="text-slate-500 text-xs truncate">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};
