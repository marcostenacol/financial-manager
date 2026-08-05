import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Trash2 } from 'lucide-react';
import { useCostCenters } from '../hooks/useCostCenters';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { OrganizationFilterSelect } from '../../organizations/components/OrganizationFilterSelect';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

const PREDEFINED_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b',
];

export const CostCentersPage = () => {
  const { showToast } = useToast();
  const { costCenters, loading, loadCostCenters, createCostCenter, deleteCostCenter } = useCostCenters();
  const { organizations, loadOrganizations } = useOrganizations();
  const { activeOrganizationId } = useActiveOrganization();
  const visibleCostCenters = costCenters.filter((costCenter) => costCenter.organizationId === activeOrganizationId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [organizationId, setOrganizationId] = useState(activeOrganizationId ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {

    loadCostCenters().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar centros de custo'), 'error'));
    loadOrganizations().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCostCenter({ name, color, organization_id: organizationId || undefined });
      await loadCostCenters();
      setName('');
      setColor(PREDEFINED_COLORS[0]);
      setIsFormOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao criar centro de custo'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (pendingIds.has(id) || !window.confirm('Remover este centro de custo? Transações vinculadas perdem apenas a categorização de custo.')) return;

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await deleteCostCenter(id);
      await loadCostCenters();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao remover centro de custo'), 'error');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">Centros de Custo</h1>
          <p className="text-app-muted">Organize o fluxo de caixa empresarial por área</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <OrganizationFilterSelect organizations={organizations} />
          <button
            onClick={() => setIsFormOpen((v) => !v)}
            className="bg-app-accent hover:opacity-90 text-app-accent-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-app-card"
          >
            <Plus className="w-5 h-5" />
            Novo Centro de Custo
          </button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-app-surface border border-app-border rounded-3xl p-6 mb-6 space-y-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marketing, Operações..."
            className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50"
          />
          {organizations.length > 0 && (
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 appearance-none"
            >
              <option value="" className="bg-app-surface">Só meu (não compartilhado)</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id} className="bg-app-surface">{organization.name}</option>
              ))}
            </select>
          )}
          <div className="flex flex-wrap gap-3">
            {PREDEFINED_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-4 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-app-accent hover:opacity-90 text-app-ink font-bold px-6 py-3 rounded-2xl disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <div className="bg-app-surface border border-app-border rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-app-surface-2 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {visibleCostCenters.map((costCenter) => (
                <motion.div
                  key={costCenter.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative bg-app-surface-2 border border-app-border p-5 rounded-2xl hover:bg-white/[0.08] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${costCenter.color}20`, color: costCenter.color, border: `1px solid ${costCenter.color}40` }}
                    >
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-app-ink font-bold">{costCenter.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(costCenter.id)}
                      disabled={pendingIds.has(costCenter.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-app-muted hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleCostCenters.length === 0 && !loading && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-app-surface-2 rounded-full mb-4">
                  <Briefcase className="w-12 h-12 text-app-muted" />
                </div>
                <h3 className="text-app-ink font-bold text-lg">Nenhum centro de custo</h3>
                <p className="text-app-muted mt-1">Crie centros de custo para organizar o fluxo empresarial.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
