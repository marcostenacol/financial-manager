import { motion } from 'framer-motion';
import { X, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Calendar, Tag, Wallet as WalletIcon } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  occurredAt: string;
  category?: { name: string; color: string };
  wallet?: { name: string };
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailModal = ({ isOpen, onClose, onEdit, onDelete, transaction }: TransactionDetailModalProps) => {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income';

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
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Detalhes da Transação</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-500/10 rounded-xl transition-colors text-blue-400"
              title="Editar Transação"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400"
              title="Excluir Transação"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isIncome ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {isIncome ? (
                <ArrowUpCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <ArrowDownCircle className="w-8 h-8 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-slate-400 text-sm">{transaction.description}</p>
              <p className={`text-2xl font-bold font-mono ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                {isIncome ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.amount))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
              <Calendar className="w-5 h-5 text-slate-500" />
              <span className="text-white">
                {new Date(transaction.occurredAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {transaction.wallet && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <WalletIcon className="w-5 h-5 text-slate-500" />
                <span className="text-white">{transaction.wallet.name}</span>
              </div>
            )}

            {transaction.category && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <Tag className="w-5 h-5 text-slate-500" />
                <span className="text-white">{transaction.category.name}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
