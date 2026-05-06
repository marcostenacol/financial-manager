import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  Wallet as WalletIcon,
  Tag,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { api } from '../../../services/api';
import { CreateTransactionModal } from '../components/CreateTransactionModal';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  occurredAt: string;
  category?: { name: string; color: string };
  wallet?: { name: string };
}

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [filterType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = filterType !== 'all' ? { type: filterType } : {};
      const response = await api.get('/transactions', { params });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar transações', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Transações</h1>
          <p className="text-slate-400">Acompanhe seu fluxo de caixa detalhadamente</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex items-center">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Tudo
            </button>
            <button 
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Entradas
            </button>
            <button 
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'expense' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Saídas
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Busca e Filtros Avançados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por descrição..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-300 hover:bg-white/10 transition-all font-medium">
          <Filter className="w-5 h-5" />
          Filtros Avançados
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {transactions.map((transaction) => (
                <motion.div 
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${transaction.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {transaction.type === 'income' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{transaction.description}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-white/5 px-2 py-1 rounded-lg">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.occurredAt)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-white/5 px-2 py-1 rounded-lg">
                          <WalletIcon className="w-3 h-3" />
                          {transaction.wallet?.name || 'Carteira'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                      </p>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${
                        transaction.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {transaction.status === 'completed' ? 'Efetivado' : 'Pendente'}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-slate-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {transactions.length === 0 && !loading && (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <ArrowUpCircle className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg">Nenhuma transação encontrada</h3>
                <p className="text-slate-500 mt-1 max-w-xs">Parece que você ainda não registrou movimentos financeiros com este filtro.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadTransactions}
      />
    </div>
  );
};
