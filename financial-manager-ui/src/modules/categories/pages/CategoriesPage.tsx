import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Tag, MoreVertical } from 'lucide-react';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { UpdateCategoryModal } from '../components/UpdateCategoryModal';
import { useToast } from '../../../shared/components/useToast';
import { useCategories, type Category } from '../hooks/useCategories';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { OrganizationFilterSelect } from '../../organizations/components/OrganizationFilterSelect';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const CategoriesPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const { categories, loading, loadCategories } = useCategories(scope);
  const { organizations, loadOrganizations } = useOrganizations();
  const visibleCategories = scope === 'business'
    ? categories.filter((category) => category.organizationId === activeOrganizationId || (!category.organizationId && !category.userId))
    : categories;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
     
    loadCategories().catch((err) => showToast(getErrorMessage(err, t('categories.errors.load')), 'error'));
    loadOrganizations().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return t('common.income');
      case 'expense': return t('common.expense');
      default: return t('categories.type.both');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">{t('categories.title')}</h1>
          <p className="text-app-muted">{t('categories.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {scope === 'business' && <OrganizationFilterSelect organizations={organizations} />}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-app-accent hover:opacity-90 text-app-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-app-card"
          >
            <Plus className="w-5 h-5" />
            {t('categories.new')}
          </button>
        </div>
      </div>

      <div className="bg-app-surface-2 backdrop-blur-xl border border-app-border rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-app-surface-2 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {visibleCategories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleEdit(category)}
                  className="group relative bg-app-surface-2 border border-app-border p-5 rounded-2xl hover:bg-app-accent-soft transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color, border: `1px solid ${category.color}40` }}
                    >
                      <Tag className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-app-ink font-bold">{category.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`ledger-stamp ${
                          category.type === 'income' ? 'text-app-success' :
                          category.type === 'expense' ? 'text-app-danger' : 'text-app-accent'
                        }`}>
                          {getTypeLabel(category.type)}
                        </span>
                      </div>
                    </div>

                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-app-muted hover:text-app-ink">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleCategories.length === 0 && !loading && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-app-surface-2 rounded-full mb-4">
                  <Tag className="w-12 h-12 text-app-muted" />
                </div>
                <h3 className="text-app-ink font-bold text-lg">{t('categories.empty.title')}</h3>
                <p className="text-app-muted mt-1">{t('categories.empty.description')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateCategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadCategories}
      />

      <UpdateCategoryModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={loadCategories}
        category={selectedCategory}
      />
    </div>
  );
};
