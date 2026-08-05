import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar, Trash2, Edit2 } from 'lucide-react';
import { useSavingsGoals, type SavingsGoal } from '../hooks/useSavingsGoals';
import { CreateSavingsGoalModal } from '../components/CreateSavingsGoalModal';
import { ConfirmDangerModal } from '../../../shared/components/ConfirmDangerModal';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const SavingsGoalsPage = () => {
  const { showToast } = useToast();
  const { goals, loading, loadGoals, deleteGoal, clearAllGoals } = useSavingsGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  useEffect(() => {
     
    loadGoals().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar metas'), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (pendingIds.has(id) || !window.confirm('Tem certeza que deseja excluir esta meta?')) return;

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await deleteGoal(id);
      await loadGoals();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao excluir meta'), 'error');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(undefined);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const handleClearAll = async () => {
    try {
      await clearAllGoals();
      setIsClearAllModalOpen(false);
      loadGoals();
      showToast('Metas removidas com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao limpar metas'), 'error');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">Metas de Economia</h1>
          <p className="text-app-muted">Poupe dinheiro para seus grandes objetivos</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-app-accent hover:opacity-90 text-app-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-app-card"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </button>
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            className="bg-app-surface-2 hover:bg-red-500/10 text-app-ink hover:text-red-400 p-3 rounded-2xl border border-app-border transition-all active:scale-95"
            title="Limpar todas as metas"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-app-surface-2 border border-app-border rounded-3xl animate-pulse" />
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
                  className="bg-app-surface-2 backdrop-blur-xl border border-app-border p-6 rounded-3xl hover:bg-white/[0.07] transition-all group"
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
                        className="p-2 text-app-muted hover:text-app-ink transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        disabled={pendingIds.has(goal.id)}
                        className="p-2 text-app-muted hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-app-ink font-bold text-xl mb-1">{goal.name}</h3>
                  <div className="flex items-center gap-2 text-app-muted text-sm mb-6">
                    <TrendingUp className="w-4 h-4" />
                    <span>{progress}% concluído</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-app-muted">Progresso</span>
                      <span className="text-app-ink font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}
                        <span className="text-app-muted font-normal"> / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount)}</span>
                      </span>
                    </div>

                    <div className="h-3 bg-app-surface-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full shadow-lg"
                        style={{ backgroundColor: goal.color, boxShadow: `0 0 20px ${goal.color}40` }}
                      />
                    </div>

                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-xs text-app-muted pt-2">
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
              <div className="p-4 bg-app-surface-2 rounded-full mb-4">
                <Target className="w-12 h-12 text-app-muted" />
              </div>
              <h3 className="text-app-ink font-bold text-lg">Nenhuma meta definida</h3>
              <p className="text-app-muted mt-1">Defina objetivos financeiros para te ajudar a poupar.</p>
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

      <ConfirmDangerModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        title="Limpar todas as metas"
        warning="Remove permanentemente todas as suas metas de economia. Não afeta carteiras, transações ou recorrências."
        actions={[
          {
            label: 'Limpar metas',
            description: 'Remove todas as metas de economia cadastradas.',
            onClick: handleClearAll,
          },
        ]}
      />
    </div>
  );
};
