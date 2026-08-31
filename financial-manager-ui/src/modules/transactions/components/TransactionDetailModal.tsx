import { motion } from 'framer-motion';
import { X, Pencil, Trash2, Copy, ArrowUpCircle, ArrowDownCircle, Calendar, Tag, Wallet as WalletIcon, User } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  occurredAt: string;
  category?: { name: string; color: string };
  wallet?: { name: string };
  person?: { id: string; name: string } | null;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  deleting?: boolean;
  transaction: Transaction | null;
}

export const TransactionDetailModal = ({ isOpen, onClose, onEdit, onDelete, onDuplicate, deleting, transaction }: TransactionDetailModalProps) => {
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
        className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">Detalhes da Transação</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-app-accent-soft rounded-xl transition-colors text-app-accent"
              title="Editar Transação"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted hover:text-app-ink"
              title="Duplicar Transação"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 disabled:opacity-50"
              title="Excluir Transação"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
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
              <p className="text-app-muted text-sm">{transaction.description}</p>
              <p className={`ledger-figure text-3xl ${isIncome ? 'text-app-success' : 'text-app-danger'}`}>
                {isIncome ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.amount))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 bg-app-surface-2 border border-app-border rounded-2xl p-4">
              <Calendar className="w-5 h-5 text-app-muted" />
              <span className="text-app-ink">
                {new Date(transaction.occurredAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {transaction.wallet && (
              <div className="flex items-center gap-3 bg-app-surface-2 border border-app-border rounded-2xl p-4">
                <WalletIcon className="w-5 h-5 text-app-muted" />
                <span className="text-app-ink">{transaction.wallet.name}</span>
              </div>
            )}

            {transaction.category && (
              <div className="flex items-center gap-3 bg-app-surface-2 border border-app-border rounded-2xl p-4">
                <Tag className="w-5 h-5 text-app-muted" />
                <span className="text-app-ink">{transaction.category.name}</span>
              </div>
            )}

            {transaction.person && (
              <div className="flex items-center gap-3 bg-app-accent-soft border border-app-accent/30 rounded-2xl p-4">
                <User className="w-5 h-5 text-app-accent" />
                <span className="text-app-ink">Gasto de {transaction.person.name}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
