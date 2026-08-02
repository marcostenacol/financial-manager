import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Clock, Wallet as WalletIcon, X } from 'lucide-react';
import { useRecurrences, type Recurrence } from '../hooks/useRecurrences';
import { CreateRecurrenceModal } from '../components/CreateRecurrenceModal';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const RecurrencesPage = () => {
  const { showToast } = useToast();
  const { recurrences, loading, loadRecurrences, cancelRecurrence, toggleRecurrence } = useRecurrences();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
     
    loadRecurrences().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar recorrências'), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return labels[period] || period;
  };

  const handleCancel = async (id: string) => {
    if (pendingIds.has(id) || !confirm('Tem certeza que deseja cancelar esta recorrência definitivamente?')) return;

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await cancelRecurrence(id);
      loadRecurrences();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao cancelar recorrência'), 'error');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    if (pendingIds.has(id)) return;

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await toggleRecurrence(id);
      loadRecurrences();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao alternar status da recorrência'), 'error');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const isExpired = (recurrence: Recurrence) => {
    // endsAt só é preenchido pela ação de cancelar (não há campo de data de término na criação),
    // então a própria presença do valor já indica "cancelada" — sem depender de comparar
    // relógio do servidor com o do cliente, que causava a recorrência aparecer como
    // "Pausada" até a página ser recarregada.
    return !!recurrence.endsAt;
  };

  const visibleRecurrences = showCancelled ? recurrences : recurrences.filter((recurrence) => !isExpired(recurrence));

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Recorrências</h1>
          <p className="text-slate-400">Gerencie seus gastos e ganhos automáticos</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="accent-blue-600"
            />
            Mostrar canceladas
          </label>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            Nova Recorrência
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {visibleRecurrences.map((recurrence) => (
                <motion.div
                  key={recurrence.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${recurrence.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold">{recurrence.description}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-white/5 px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {getPeriodLabel(recurrence.period)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-white/5 px-2 py-1 rounded-lg">
                          <WalletIcon className="w-3 h-3" />
                          {recurrence.wallet?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${recurrence.type === 'income' ? 'text-emerald-400' : 'text-red-400'} ${isExpired(recurrence) ? 'opacity-50 line-through' : ''}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(recurrence.amount)}
                      </p>
                      {isExpired(recurrence) ? (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Encerrada</span>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Próximo: {new Date(recurrence.startsAt).toLocaleDateString('pt-BR')}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${recurrence.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {recurrence.isActive ? 'Ativa' : 'Pausada'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!isExpired(recurrence) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(recurrence.id)}
                          disabled={pendingIds.has(recurrence.id)}
                          className={`p-2 rounded-xl transition-all disabled:opacity-50 ${recurrence.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={recurrence.isActive ? 'Pausar' : 'Ativar'}
                        >
                          <RefreshCw className={`w-5 h-5 ${!recurrence.isActive ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleCancel(recurrence.id)}
                          disabled={pendingIds.has(recurrence.id)}
                          className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-xl transition-all disabled:opacity-50"
                          title="Cancelar Definitivamente"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleRecurrences.length === 0 && !loading && (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <RefreshCw className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg">
                  {recurrences.length === 0 ? 'Nenhuma recorrência' : 'Nenhuma recorrência ativa'}
                </h3>
                <p className="text-slate-500 mt-1">
                  {recurrences.length === 0
                    ? 'Configure pagamentos recorrentes para automatizar seu fluxo.'
                    : 'Todas as recorrências foram canceladas. Marque "Mostrar canceladas" para vê-las.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateRecurrenceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadRecurrences}
      />
    </div>
  );
};
