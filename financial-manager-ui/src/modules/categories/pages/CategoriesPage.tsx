import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, MoreVertical } from 'lucide-react';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { UpdateCategoryModal } from '../components/UpdateCategoryModal';
import { useToast } from '../../../shared/components/useToast';
import { useCategories, type Category } from '../hooks/useCategories';

export const CategoriesPage = () => {
  const { showToast } = useToast();
  const { categories, loading, loadCategories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
     
    loadCategories().catch(() => showToast('Erro ao carregar categorias', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      default: return 'Ambos';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Categorias</h1>
          <p className="text-slate-400">Organize suas transações por grupos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleEdit(category)}
                  className="group relative bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${category.color}20`, color: category.color, border: `1px solid ${category.color}40` }}
                    >
                      <Tag className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{category.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md ${
                          category.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 
                          category.type === 'expense' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {getTypeLabel(category.type)}
                        </span>
                      </div>
                    </div>

                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {categories.length === 0 && !loading && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Tag className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg">Nenhuma categoria</h3>
                <p className="text-slate-500 mt-1">Crie categorias para organizar seus gastos e ganhos.</p>
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
