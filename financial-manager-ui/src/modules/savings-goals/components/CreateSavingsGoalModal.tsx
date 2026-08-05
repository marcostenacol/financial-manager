import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Target, Palette, Calendar, TrendingUp } from 'lucide-react';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';
import { CurrencyInput } from '../../../shared/components/CurrencyInput';

interface CreateSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string | null;
    color: string;
  };
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#d946ef', '#f43f5e', '#64748b'
];

export const CreateSavingsGoalModal = ({ isOpen, onClose, onSuccess, initialData }: CreateSavingsGoalModalProps) => {
  const { showToast } = useToast();
  const { createGoal, updateGoal } = useSavingsGoals();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData.name);
      setTargetAmount(Number(initialData.targetAmount));
      setCurrentAmount(Number(initialData.currentAmount));
      setDeadline(initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '');
      setColor(initialData.color);
    } else {
      setName('');
      setTargetAmount(0);
      setCurrentAmount(0);
      setDeadline('');
      setColor('#3b82f6');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        color,
      };

      if (initialData) {
        await updateGoal(initialData.id, data);
      } else {
        await createGoal(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao salvar meta'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-xl bg-app-surface border border-app-border rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-app-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-app-ink">{initialData ? 'Editar Meta' : 'Nova Meta de Economia'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">O que você quer conquistar?</label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Reserva de Emergência, Viagem, Carro..."
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Valor Alvo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted font-bold">R$</span>
                <CurrencyInput
                  required
                  value={targetAmount}
                  onChange={setTargetAmount}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all ledger-figure"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">Já tenho poupado</label>
              <div className="relative">
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
                <CurrencyInput
                  value={currentAmount}
                  onChange={setCurrentAmount}
                  className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all ledger-figure"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-app-muted ml-1">Data Limite (Opcional)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-app-muted ml-1 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cor da Meta
            </label>
            <div className="grid grid-cols-7 md:grid-cols-13 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-full aspect-square rounded-lg transition-all ${
                    color === presetColor ? 'ring-2 ring-white ring-offset-4 ring-offset-app-surface scale-90' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: presetColor }}
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
                {initialData ? 'Salvar Alterações' : 'Criar Meta Financeira'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
