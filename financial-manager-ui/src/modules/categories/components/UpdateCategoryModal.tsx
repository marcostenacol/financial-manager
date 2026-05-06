import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Palette, Tag, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { api } from '../../../services/api';

interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  userId?: string;
}

interface UpdateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#d946ef', '#f43f5e', '#64748b'
];

export const UpdateCategoryModal = ({ isOpen, onClose, onSuccess, category }: UpdateCategoryModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
      setColor(category.color);
      setType(category.type);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setLoading(true);

    try {
      await api.put(`/categories/${category.id}`, {
        name,
        color,
        type,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar categoria', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category || !window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    setDeleting(true);

    try {
      await api.delete(`/categories/${category.id}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao deletar categoria', error);
      alert('Não foi possível excluir esta categoria. Verifique se existem transações vinculadas a ela.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !category) return null;

  const isSystemCategory = !category.userId;

  return (
    <AnimatePresence>
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
            <h2 className="text-xl font-bold text-white">Editar Categoria</h2>
            <div className="flex items-center gap-2">
              {!isSystemCategory && (
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isSystemCategory ? (
            <div className="p-8 text-center">
              <div className="p-4 bg-white/5 rounded-2xl mb-4 inline-block">
                <Tag className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-bold text-lg">Categoria do Sistema</h3>
              <p className="text-slate-400 mt-2">
                Categorias globais não podem ser editadas ou removidas para garantir a integridade dos relatórios padrão.
              </p>
              <button 
                onClick={onClose}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl mt-8 transition-all"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Nome da Categoria</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
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
                <label className="text-sm font-medium text-slate-400 ml-1">Tipo de Uso</label>
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      type === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'
                    }`}
                  >
                    Receitas
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      type === 'expense' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400'
                    }`}
                  >
                    Despesas
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('both')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      type === 'both' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
                    }`}
                  >
                    Ambos
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400 ml-1 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Cor da Categoria
                </label>
                <div className="grid grid-cols-7 gap-3">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={`w-full aspect-square rounded-xl transition-all ${
                        color === presetColor ? 'ring-2 ring-white ring-offset-4 ring-offset-slate-900 scale-90' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: presetColor }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || deleting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
