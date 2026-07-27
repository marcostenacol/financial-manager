import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Calendar, Tag, Wallet as WalletIcon, CheckCircle } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../shared/components/useToast';

interface Category {
  id: string;
  name: string;
}

interface Wallet {
  id: string;
  name: string;
}

interface Filters {
  wallet_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  currentFilters: Filters;
}

export const AdvancedFiltersModal = ({ isOpen, onClose, onApply, currentFilters }: AdvancedFiltersModalProps) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filters, setFilters] = useState<Filters>(currentFilters);

  const loadData = async () => {
    try {
      const [catRes, wallRes] = await Promise.all([
        api.get('/categories'),
        api.get('/wallets')
      ]);
      setCategories(catRes.data.data);
      setWallets(wallRes.data.data);
    } catch {
      showToast('Erro ao carregar dados de filtro', 'error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
      setFilters(currentFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {};
    setFilters(cleared);
    onApply(cleared);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Filtros Avançados</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Carteira */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <WalletIcon className="w-3.5 h-3.5" /> Carteira
                </label>
                <select 
                  value={filters.wallet_id || ''}
                  onChange={(e) => setFilters({ ...filters, wallet_id: e.target.value || undefined })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="" className="bg-slate-900">Todas as carteiras</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Categoria
                </label>
                <select 
                  value={filters.category_id || ''}
                  onChange={(e) => setFilters({ ...filters, category_id: e.target.value || undefined })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="" className="bg-slate-900">Todas as categorias</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters({ ...filters, status: filters.status === status ? undefined : status })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        filters.status === status 
                          ? 'bg-blue-600/20 border-blue-500 text-white' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {status === 'pending' ? 'Pendente' : 'Efetivado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Período */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Período
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-600 font-bold uppercase ml-1">De</span>
                    <input 
                      type="date"
                      value={filters.start_date || ''}
                      onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-600 font-bold uppercase ml-1">Até</span>
                    <input 
                      type="date"
                      value={filters.end_date || ''}
                      onChange={(e) => setFilters({ ...filters, end_date: e.target.value || undefined })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 py-4 px-6 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all"
              >
                Limpar
              </button>
              <button
                onClick={handleApply}
                className="flex-[2] py-4 px-6 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                Aplicar Filtros
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
