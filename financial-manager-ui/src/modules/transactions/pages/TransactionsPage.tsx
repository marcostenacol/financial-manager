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
  RefreshCw,
  ChevronRight,
  Download
} from 'lucide-react';
import { api } from '../../../services/api';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { UpdateTransactionModal } from '../components/UpdateTransactionModal';
import { AdvancedFiltersModal } from '../components/AdvancedFiltersModal';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { useToast } from '../../../shared/components/Toast';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  occurredAt: string;
  createdAt: string;
  category?: { name: string; color: string };
  wallet?: { name: string };
  walletId: string;
  categoryId?: string;
  recurrenceId?: string | null;
  recurrence?: {
    period: string;
  };
}

export const TransactionsPage = () => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Volta para a primeira página ao buscar
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: perPage,
        ...(filterType !== 'all' ? { type: filterType } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...advancedFilters
      };

      const response = await api.get('/transactions', { params });
      setTransactions(response.data.data.transactions);
      setTotal(response.data.data.total);
    } catch {
      showToast('Erro ao carregar transações', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, debouncedSearch, page, advancedFilters]);

  const handleExport = async () => {
    try {
      const response = await api.get('/transactions/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transacoes.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      showToast('Erro ao exportar transações', 'error');
    }
  };

  const handleShowDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleEdit = () => {
    setIsDetailModalOpen(false);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTransaction || !window.confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await api.delete(`/transactions/${selectedTransaction.id}`);
      setIsDetailModalOpen(false);
      loadTransactions();
    } catch {
      showToast('Erro ao excluir transação', 'error');
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
            onClick={handleExport}
            className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl border border-white/10 transition-all active:scale-95"
            title="Exportar CSV"
          >
            <Download className="w-6 h-6 text-blue-400" />
          </button>

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsFiltersModalOpen(true)}
          className={`flex items-center justify-center gap-2 border rounded-2xl py-4 px-6 transition-all font-medium ${
            Object.keys(advancedFilters).length > 0 
              ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros Avançados
          {Object.keys(advancedFilters).length > 0 && (
            <span className="w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
              {Object.keys(advancedFilters).length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Mostrando {transactions.length} de {total} transações
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              Anterior
            </button>
            <span className="text-white font-bold px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm">
              {page}
            </span>
            <button 
              disabled={page * perPage >= total || loading}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
              Próximo
            </button>
          </div>
        </div>
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
                  onClick={() => handleShowDetail(transaction)}
                  className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${transaction.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {transaction.type === 'income' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{transaction.description}</h3>
                        {transaction.recurrenceId && (
                          <span title="Transação Recorrente">
                            <RefreshCw className="w-3 h-3 text-blue-400" />
                          </span>
                        )}
                      </div>
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

      <UpdateTransactionModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={loadTransactions}
        transaction={selectedTransaction}
      />

      <AdvancedFiltersModal 
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setPage(1);
        }}
        currentFilters={advancedFilters}
      />

      <TransactionDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        transaction={selectedTransaction}
      />
    </div>
  );
};
