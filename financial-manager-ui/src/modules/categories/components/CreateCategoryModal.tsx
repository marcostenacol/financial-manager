import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Type, Palette, ArrowUpCircle, ArrowDownCircle, Layers } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useCategories } from '../hooks/useCategories';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

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
  const { createCategory } = useCategories();
  const { organizations, loadOrganizations } = useOrganizations();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrganizations().catch(() => {});
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrganizationId(activeOrganizationId ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCategory({
        name,
        color,
        type,
        scope,
        organization_id: organizationId || undefined,
      });
      onSuccess();
      onClose();
      // Reset
      setName('');
      setColor(PREDEFINED_COLORS[0]);
      setType('expense');
      setOrganizationId('');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao criar categoria'), 'error');
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
        className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">Nova Categoria</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">Nome da Categoria</label>
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted group-focus-within:text-app-accent transition-colors" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alimentação, Lazer..."
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">Tipo de Transação</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'income' ? 'bg-emerald-600/20 border-emerald-600 text-app-ink' : 'bg-app-surface-2 border-app-border text-app-muted'
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Receita</span>
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'expense' ? 'bg-red-600/20 border-red-600 text-app-ink' : 'bg-app-surface-2 border-app-border text-app-muted'
                }`}
              >
                <ArrowDownCircle className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Despesa</span>
              </button>
              <button
                type="button"
                onClick={() => setType('both')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'both' ? 'bg-app-accent/20 border-app-accent text-app-ink' : 'bg-app-surface-2 border-app-border text-app-muted'
                }`}
              >
                <Layers className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Ambos</span>
              </button>
            </div>
          </div>

          {scope === 'business' && organizations.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Organização</label>
              <select
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all appearance-none"
              >
                <option value="" className="bg-app-surface">Só minha (não compartilhada)</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id} className="bg-app-surface">{organization.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium text-app-muted ml-1 flex items-center gap-2">
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
            className="w-full bg-app-accent hover:opacity-90 text-app-ink font-bold py-4 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-app-accent/40 border-t-white rounded-full animate-spin" />
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
