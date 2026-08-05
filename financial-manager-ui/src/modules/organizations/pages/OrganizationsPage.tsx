import { useState, useEffect } from 'react';
import { Building2, Plus, ChevronDown, ChevronRight, KeyRound, Trash2 } from 'lucide-react';
import { useOrganizations, type Organization } from '../hooks/useOrganizations';
import { OrganizationDetailPanel } from '../components/OrganizationDetailPanel';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const OrganizationsPage = () => {
  const { showToast } = useToast();
  const { organizations, loading, loadOrganizations, createOrganization, redeemInvite, deleteOrganization } = useOrganizations();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {

    loadOrganizations().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar organizações'), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createOrganization(newName);
      setNewName('');
      await loadOrganizations();
      showToast('Organização criada com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao criar organização'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeeming(true);
    try {
      await redeemInvite(inviteCode.trim());
      setInviteCode('');
      await loadOrganizations();
      showToast('Você entrou na organização com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Código de convite inválido'), 'error');
    } finally {
      setRedeeming(false);
    }
  };

  const toggleExpand = (organization: Organization) => {
    setExpandedId((prev) => (prev === organization.id ? null : organization.id));
  };

  const handleDelete = async (e: React.MouseEvent, organization: Organization) => {
    e.stopPropagation();
    if (deletingId || !window.confirm(`Excluir a organização "${organization.name}"? Isso remove todos os membros e convites. Só é possível se ela não tiver carteiras, categorias, centros de custo ou metas vinculadas.`)) return;

    setDeletingId(organization.id);
    try {
      await deleteOrganization(organization.id);
      await loadOrganizations();
      showToast('Organização removida com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao excluir organização'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="ledger-title text-4xl text-app-ink">Organizações</h1>
        <p className="text-app-muted">Compartilhe carteiras empresariais com outras pessoas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <form onSubmit={handleCreate} className="bg-app-surface-2 border border-app-border rounded-3xl p-6 space-y-3">
          <h3 className="text-app-ink font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-app-accent" />
            Criar organização
          </h3>
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Padaria do João"
            className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-app-accent hover:opacity-90 text-app-ink font-bold px-6 py-3 rounded-2xl flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Criar
          </button>
        </form>

        <form onSubmit={handleRedeem} className="bg-app-surface-2 border border-app-border rounded-3xl p-6 space-y-3">
          <h3 className="text-app-ink font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            Entrar com código de convite
          </h3>
          <input
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Ex: ABCD-1234"
            className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink font-mono focus:outline-none focus:ring-2 focus:ring-app-accent/50"
          />
          <button
            type="submit"
            disabled={redeeming}
            className="bg-amber-600 hover:bg-amber-500 text-app-ink font-bold px-6 py-3 rounded-2xl flex items-center gap-2 disabled:opacity-50"
          >
            Entrar
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-app-surface-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {organizations.map((organization) => (
            <div key={organization.id}>
              <button
                onClick={() => toggleExpand(organization)}
                className="w-full flex items-center justify-between bg-app-surface-2 border border-app-border rounded-2xl p-4 hover:bg-white/[0.08] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-app-accent" />
                  <div className="text-left">
                    <p className="text-app-ink font-bold">{organization.name}</p>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-app-muted">
                      {organization.role === 'owner' ? 'Dono' : 'Membro'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {organization.role === 'owner' && (
                    <button
                      onClick={(e) => handleDelete(e, organization)}
                      disabled={deletingId === organization.id}
                      title="Excluir organização"
                      className="p-2 text-app-muted hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {expandedId === organization.id ? <ChevronDown className="w-5 h-5 text-app-muted" /> : <ChevronRight className="w-5 h-5 text-app-muted" />}
                </div>
              </button>

              {expandedId === organization.id && (
                <div className="mt-2">
                  <OrganizationDetailPanel organization={organization} onOwnershipTransferred={loadOrganizations} />
                </div>
              )}
            </div>
          ))}

          {organizations.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-app-border rounded-3xl">
              <Building2 className="w-12 h-12 text-app-muted mb-4" />
              <h3 className="text-app-ink font-bold text-lg">Nenhuma organização ainda</h3>
              <p className="text-app-muted mt-1 max-w-xs">Crie uma organização para compartilhar carteiras empresariais com sua equipe, ou entre em uma existente com um código de convite.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
