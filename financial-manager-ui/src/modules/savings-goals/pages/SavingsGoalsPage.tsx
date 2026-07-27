import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../../services/api';
import { CreateSavingsGoalModal } from '../components/CreateSavingsGoalModal';
import { useToast } from '../../../shared/components/useToast';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  color: string;
}

export const SavingsGoalsPage = () => {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();

  const loadGoals = async () => {
    try {
      const response = await api.get('/savings-goals');
      setGoals(response.data.data);
    } catch {
      showToast('Erro ao carregar metas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      await api.delete(`/savings-goals/${id}`);
      await loadGoals();
    } catch {
      showToast('Erro ao excluir meta', 'error');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(undefined);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Metas de Economia</h1>
          <p className="text-slate-400">Poupe dinheiro para seus grandes objetivos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {goals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="p-3 rounded-2xl"
                      style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                    >
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-xl mb-1">{goal.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                    <TrendingUp className="w-4 h-4" />
                    <span>{progress}% concluído</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Progresso</span>
                      <span className="text-white font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}
                        <span className="text-slate-500 font-normal"> / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount)}</span>
                      </span>
                    </div>

                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full shadow-lg"
                        style={{ backgroundColor: goal.color, boxShadow: `0 0 20px ${goal.color}40` }}
                      />
                    </div>

                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Meta para: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {goals.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <Target className="w-12 h-12 text-slate-600" />
              </div>
              <h3 className="text-white font-bold text-lg">Nenhuma meta definida</h3>
              <p className="text-slate-500 mt-1">Defina objetivos financeiros para te ajudar a poupar.</p>
            </div>
          )}
        </div>
      )}

      <CreateSavingsGoalModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={loadGoals}
        initialData={editingGoal}
      />
    </div>
  );
};
