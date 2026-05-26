import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Tag, Type, Palette, ArrowUpCircle, ArrowDownCircle, Layers } from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../shared/components/Toast';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PREDEFINED_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
];

export const CreateCategoryModal = ({ isOpen, onClose, onSuccess }: CreateCategoryModalProps) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/categories', {
        name,
        color,
        type,
      });
      onSuccess();
      onClose();
      // Reset
      setName('');
      setColor(PREDEFINED_COLORS[0]);
      setType('expense');
    } catch (error) {
      showToast('Erro ao criar categoria', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Nova Categoria</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Nome da Categoria</label>
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alimentação, Lazer..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Tipo de Transação</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'income' ? 'bg-emerald-600/20 border-emerald-600 text-white' : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Receita</span>
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'expense' ? 'bg-red-600/20 border-red-600 text-white' : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                <ArrowDownCircle className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Despesa</span>
              </button>
              <button
                type="button"
                onClick={() => setType('both')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'both' ? 'bg-blue-600/20 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                <Layers className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Ambos</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400 ml-1 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cor da Categoria
            </label>
            <div className="flex flex-wrap gap-3">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Categoria
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
