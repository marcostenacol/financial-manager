import { useState, useEffect } from 'react';
import { Building2, Plus, ChevronDown, ChevronRight, KeyRound } from 'lucide-react';
import { useOrganizations, type Organization } from '../hooks/useOrganizations';
import { OrganizationDetailPanel } from '../components/OrganizationDetailPanel';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const OrganizationsPage = () => {
  const { showToast } = useToast();
  const { organizations, loading, loadOrganizations, createOrganization, redeemInvite } = useOrganizations();
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

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Organizações</h1>
        <p className="text-slate-400">Compartilhe carteiras empresariais com outras pessoas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <form onSubmit={handleCreate} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Criar organização
          </h3>
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Padaria do João"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Criar
          </button>
        </form>

        <form onSubmit={handleRedeem} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
          <h3 className="text-white font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            Entrar com código de convite
          </h3>
          <input
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Ex: ABCD-1234"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            disabled={redeeming}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 disabled:opacity-50"
          >
            Entrar
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {organizations.map((organization) => (
            <div key={organization.id}>
              <button
                onClick={() => toggleExpand(organization)}
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.08] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-white font-bold">{organization.name}</p>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                      {organization.role === 'owner' ? 'Dono' : 'Membro'}
                    </span>
                  </div>
                </div>
                {expandedId === organization.id ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
              </button>

              {expandedId === organization.id && (
                <div className="mt-2">
                  <OrganizationDetailPanel organization={organization} />
                </div>
              )}
            </div>
          ))}

          {organizations.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-3xl">
              <Building2 className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-white font-bold text-lg">Nenhuma organização ainda</h3>
              <p className="text-slate-500 mt-1 max-w-xs">Crie uma organização para compartilhar carteiras empresariais com sua equipe, ou entre em uma existente com um código de convite.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
