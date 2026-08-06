import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Save, Palette, Tag, Trash2 } from 'lucide-react';
import { useToast } from '../../../shared/components/useToast';
import { useCategories, type Category } from '../hooks/useCategories';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { updateCategory, deleteCategory } = useCategories();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      await updateCategory(category.id, {
        name,
        color,
        type,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('categories.errors.update')), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category || !window.confirm(t('categories.confirmDelete'))) return;
    setDeleting(true);

    try {
      await deleteCategory(category.id);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, t('categories.errors.delete')), 'error');
      alert(t('categories.errors.deleteBlocked'));
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !category) return null;

  const isSystemCategory = !category.userId && !category.organizationId;

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
          className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="p-6 border-b border-app-border flex justify-between items-center">
            <h2 className="text-xl font-bold text-app-ink">{t('categories.edit.title')}</h2>
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
              <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isSystemCategory ? (
            <div className="p-8 text-center">
              <div className="p-4 bg-app-surface-2 rounded-2xl mb-4 inline-block">
                <Tag className="w-8 h-8 text-app-muted" />
              </div>
              <h3 className="text-app-ink font-bold text-lg">{t('categories.system.title')}</h3>
              <p className="text-app-muted mt-2">
                {t('categories.system.description')}
              </p>
              <button 
                onClick={onClose}
                className="w-full bg-app-surface-2 hover:bg-app-surface-2 text-app-ink font-bold py-4 rounded-2xl mt-8 transition-all"
              >
                {t('common.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-app-muted ml-1">{t('categories.form.nameLabel')}</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('categories.form.namePlaceholder')}
                    className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-app-muted ml-1">{t('categories.form.usageTypeLabel')}</label>
                <div className="flex p-1 bg-app-surface-2 border border-app-border rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      type === 'income' ? 'bg-emerald-600 text-app-ink shadow-lg' : 'text-app-muted'
                    }`}
                  >
                    {t('categories.type.incomePlural')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      type === 'expense' ? 'bg-red-600 text-app-ink shadow-lg' : 'text-app-muted'
                    }`}
                  >
                    {t('categories.type.expensePlural')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('both')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      type === 'both' ? 'bg-app-accent text-app-ink shadow-lg' : 'text-app-muted'
                    }`}
                  >
                    {t('categories.type.both')}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-app-muted ml-1 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  {t('categories.form.colorLabel')}
                </label>
                <div className="grid grid-cols-7 gap-3">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={`w-full aspect-square rounded-xl transition-all ${
                        color === presetColor ? 'ring-2 ring-white ring-offset-4 ring-offset-app-surface scale-90' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: presetColor }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || deleting}
                className="w-full bg-app-accent hover:opacity-90 text-app-ink font-bold py-4 rounded-2xl shadow-lg shadow-app-card flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-app-accent/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('categories.edit.submit')}
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
