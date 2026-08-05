import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Clock, Wallet as WalletIcon, X, Trash2, Pencil, Play } from 'lucide-react';
import { useRecurrences, type Recurrence } from '../hooks/useRecurrences';
import { CreateRecurrenceModal } from '../components/CreateRecurrenceModal';
import { UpdateRecurrenceModal } from '../components/UpdateRecurrenceModal';
import { ConfirmDangerModal } from '../../../shared/components/ConfirmDangerModal';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { OrganizationFilterSelect } from '../../organizations/components/OrganizationFilterSelect';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const RecurrencesPage = () => {
  const { showToast } = useToast();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const { organizations, loadOrganizations } = useOrganizations();
  const { recurrences, loading, loadRecurrences, cancelRecurrence, toggleRecurrence, runRecurrenceNow, clearAllRecurrences } = useRecurrences();
  const scopedRecurrences = scope === 'business'
    ? recurrences.filter((recurrence) => recurrence.wallet?.organizationId === activeOrganizationId)
    : recurrences;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRecurrence, setSelectedRecurrence] = useState<Recurrence | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [showCancelled, setShowCancelled] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  useEffect(() => {

    loadRecurrences().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar recorrências'), 'error'));
    loadOrganizations().catch(() => {});
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

  const handleEdit = (recurrence: Recurrence) => {
    setSelectedRecurrence(recurrence);
    setIsUpdateModalOpen(true);
  };

  const handleRunNow = async (id: string) => {
    if (pendingIds.has(id) || !confirm('Lançar a ocorrência desta recorrência agora?')) return;

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await runRecurrenceNow(id);
      loadRecurrences();
      showToast('Ocorrência lançada com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao lançar a ocorrência'), 'error');
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

  const visibleRecurrences = showCancelled ? scopedRecurrences : scopedRecurrences.filter((recurrence) => !isExpired(recurrence));

  // "Limpar tudo" precisa saber exatamente o que está limpando: no escopo empresarial, só faz
  // sentido com uma organização específica selecionada — sem isso, o botão sempre limpava as
  // recorrências PESSOAIS do usuário, mesmo estando na aba Empresarial.
  const canClearAll = scope === 'personal' || !!activeOrganizationId;
  const clearAllTarget = scope === 'business' ? (activeOrganizationId ?? undefined) : undefined;

  const handleClearAll = async () => {
    try {
      await clearAllRecurrences(clearAllTarget);
      setIsClearAllModalOpen(false);
      loadRecurrences();
      showToast('Recorrências removidas com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao limpar recorrências'), 'error');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">Recorrências</h1>
          <p className="text-app-muted">Gerencie seus gastos e ganhos automáticos</p>
        </div>
        <div className="flex items-center gap-4">
          {scope === 'business' && <OrganizationFilterSelect organizations={organizations} />}
          <label className="flex items-center gap-2 text-sm text-app-muted select-none cursor-pointer">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="accent-blue-600"
            />
            Mostrar canceladas
          </label>
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            disabled={!canClearAll}
            className="bg-app-surface-2 hover:bg-red-500/10 text-app-ink hover:text-red-400 p-3 rounded-2xl border border-app-border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-app-surface-2 disabled:hover:text-app-ink"
            title={canClearAll ? 'Limpar todas as recorrências' : 'Selecione uma organização específica para limpar os dados dela'}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-app-accent hover:opacity-90 text-app-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-app-card"
          >
            <Plus className="w-5 h-5" />
            Nova Recorrência
          </button>
        </div>
      </div>

      <div className="bg-app-surface-2 backdrop-blur-xl border border-app-border rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-app-surface-2 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-app-border">
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
                      <h3 className="text-app-ink font-bold">{recurrence.description}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-app-muted font-medium bg-app-surface-2 px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {getPeriodLabel(recurrence.period)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-app-muted font-medium bg-app-surface-2 px-2 py-1 rounded-lg">
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
                          <p className="text-[10px] text-app-muted uppercase tracking-widest font-bold">Próximo: {new Date(recurrence.startsAt).toLocaleDateString('pt-BR')}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${recurrence.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {recurrence.isActive ? 'Ativa' : 'Pausada'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!isExpired(recurrence) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(recurrence)}
                          className="p-2 hover:bg-app-accent-soft text-app-muted hover:text-app-accent rounded-xl transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRunNow(recurrence.id)}
                          disabled={pendingIds.has(recurrence.id) || !recurrence.isActive}
                          className="p-2 hover:bg-app-accent-soft text-app-muted hover:text-app-accent rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title={recurrence.isActive ? 'Rodar agora' : 'Ative a recorrência para rodar manualmente'}
                        >
                          <Play className="w-5 h-5" />
                        </button>
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
                          className="p-2 hover:bg-red-500/10 text-app-muted hover:text-red-400 rounded-xl transition-all disabled:opacity-50"
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
                <div className="p-4 bg-app-surface-2 rounded-full mb-4">
                  <RefreshCw className="w-12 h-12 text-app-muted" />
                </div>
                <h3 className="text-app-ink font-bold text-lg">
                  {recurrences.length === 0 ? 'Nenhuma recorrência' : 'Nenhuma recorrência ativa'}
                </h3>
                <p className="text-app-muted mt-1">
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

      <UpdateRecurrenceModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={loadRecurrences}
        recurrence={selectedRecurrence}
      />

      <ConfirmDangerModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        title={scope === 'business' ? 'Limpar recorrências da organização' : 'Limpar todas as recorrências pessoais'}
        warning={
          scope === 'business'
            ? 'Remove as recorrências da organização selecionada — não afeta suas recorrências pessoais. As transações já geradas continuam existindo, só deixam de estar vinculadas a uma recorrência.'
            : 'Remove suas recorrências pessoais — não afeta nenhuma organização. As transações que elas já geraram no passado continuam existindo, só deixam de estar vinculadas a uma recorrência.'
        }
        actions={[
          {
            label: 'Limpar recorrências',
            description: 'Remove todas as recorrências configuradas. Não afeta transações já lançadas.',
            onClick: handleClearAll,
          },
        ]}
      />
    </div>
  );
};
