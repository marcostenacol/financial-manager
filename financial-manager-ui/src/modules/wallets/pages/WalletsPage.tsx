import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet as WalletIcon, CreditCard, Banknote, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../../services/api';
import { CreateWalletModal } from '../components/CreateWalletModal';

interface Wallet {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
}

export const WalletsPage = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const response = await api.get('/wallets');
      setWallets(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar carteiras', error);
    } finally {
      setLoading(false);
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'credit': return <CreditCard className="w-6 h-6" />;
      case 'savings': return <Banknote className="w-6 h-6" />;
      default: return <WalletIcon className="w-6 h-6" />;
    }
  };

  const getWalletGradient = (type: string) => {
    switch (type) {
      case 'credit': return 'from-purple-600 to-indigo-600';
      case 'savings': return 'from-emerald-600 to-teal-600';
      case 'investment': return 'from-amber-500 to-orange-600';
      default: return 'from-blue-600 to-indigo-600';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Minhas Carteiras</h1>
          <p className="text-slate-400">Gerencie seu dinheiro em diferentes contas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Nova Carteira
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {wallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative group h-48 p-6 rounded-3xl border border-white/10 bg-gradient-to-br ${getWalletGradient(wallet.type)} shadow-xl overflow-hidden`}
              >
                {/* Efeito de Vidro */}
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-white/70" />
                    </button>
                  </div>

                  <div>
                    <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">{wallet.name}</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                    </h2>
                  </div>
                </div>

                {/* Círculos Decorativos */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              </motion.div>
            ))}
          </AnimatePresence>

          {wallets.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <WalletIcon className="w-12 h-12 text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium text-lg">Nenhuma carteira cadastrada.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 font-bold"
              >
                Clique aqui para criar a primeira
              </button>
            </div>
          )}
        </div>
      )}

      <CreateWalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadWallets}
      />
    </div>
  );
};
