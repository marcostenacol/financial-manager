import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Wallet as WalletIcon, Tag, Clock, ArrowUpCircle, ArrowDownCircle, Edit2, Trash2, Hash, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  occurredAt: string;
  createdAt: string;
  category?: { name: string; color: string; icon?: string };
  wallet?: { name: string };
  recurrenceId?: string | null;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailModal = ({ isOpen, onClose, onEdit, onDelete, transaction }: TransactionDetailModalProps) => {
  if (!transaction) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header com Cor de Acordo com o Tipo */}
            <div className={`h-24 flex items-end px-8 pb-4 ${
              transaction.type === 'income' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    transaction.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {transaction.type === 'income' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white leading-none">{transaction.description}</h2>
                    <p className="text-slate-400 text-sm mt-1">Detalhes da Transação</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Valor e Status */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Valor</p>
                  <p className={`text-4xl font-mono font-bold ${
                    transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    transaction.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {transaction.status === 'completed' ? 'Efetivado' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Informações Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-blue-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ocorrido em</p>
                      <p className="text-sm text-white font-medium">{formatDate(transaction.occurredAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-purple-400">
                      <WalletIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Carteira</p>
                      <p className="text-sm text-white font-medium">{transaction.wallet?.name || 'Não informada'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-amber-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria</p>
                      <p className="text-sm text-white font-medium">{transaction.category?.name || 'Sem categoria'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-emerald-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Criado em</p>
                      <p className="text-sm text-white font-medium">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 {transaction.recurrenceId && (
                   <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                     <RefreshCw className="w-5 h-5 text-blue-400" />
                     <p className="text-sm text-blue-100">Esta transação foi gerada automaticamente por uma <strong>recorrência</strong>.</p>
                   </div>
                 )}

                 <div className="flex items-center gap-3 text-slate-600">
                   <Hash className="w-4 h-4" />
                   <p className="text-[10px] font-mono tracking-tighter uppercase">Ref ID: {transaction.id}</p>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
              <button 
                onClick={onDelete}
                className="p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all active:scale-95"
                title="Excluir"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <button 
                onClick={onEdit}
                className="flex-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Edit2 className="w-5 h-5" />
                Editar Transação
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
