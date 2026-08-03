import { useState, useEffect } from 'react';
import { Trash2, Plus, Ban, Copy } from 'lucide-react';
import { useOrganizations, type Organization, type Member, type Invite } from '../hooks/useOrganizations';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

interface OrganizationDetailPanelProps {
  organization: Organization;
}

export const OrganizationDetailPanel = ({ organization }: OrganizationDetailPanelProps) => {
  const { showToast } = useToast();
  const { loadMembers, removeMember, loadInvites, createInvite, revokeInvite } = useOrganizations();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState<'single' | 'multi'>('single');
  const [multiUses, setMultiUses] = useState(5);
  const [creatingInvite, setCreatingInvite] = useState(false);

  const isOwner = organization.role === 'owner';

  const load = async () => {
    try {
      const [membersData, invitesData] = await Promise.all([
        loadMembers(organization.id),
        isOwner ? loadInvites(organization.id) : Promise.resolve([]),
      ]);
      setMembers(membersData);
      setInvites(invitesData);
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao carregar dados da organização'), 'error');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization.id]);

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Remover este membro da organização?')) return;
    try {
      await removeMember(organization.id, userId);
      await load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao remover membro'), 'error');
    }
  };

  const handleCreateInvite = async () => {
    setCreatingInvite(true);
    try {
      await createInvite(organization.id, {
        expires_in_days: expiresInDays,
        max_uses: maxUses === 'multi' ? multiUses : undefined,
      });
      await load();
      showToast('Convite criado com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao criar convite'), 'error');
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!window.confirm('Revogar este convite?')) return;
    try {
      await revokeInvite(organization.id, inviteId);
      await load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao revogar convite'), 'error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Código copiado', 'success');
  };

  const isInviteActive = (invite: Invite) => {
    if (invite.revokedAt) return false;
    if (new Date(invite.expiresAt) < new Date()) return false;
    const limit = invite.maxUses ?? 1;
    return invite.usesCount < limit;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8">
      <div>
        <h3 className="text-white font-bold mb-4">Membros</h3>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3">
              <div>
                <p className="text-white text-sm font-medium">{member.user.email}</p>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{member.role === 'owner' ? 'Dono' : 'Membro'}</span>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleRemoveMember(member.userId)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isOwner && (
        <div>
          <h3 className="text-white font-bold mb-4">Convites</h3>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Validade</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Uso</label>
                <select
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value as 'single' | 'multi')}
                  className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                >
                  <option value="single">Único uso</option>
                  <option value="multi">Múltiplo uso</option>
                </select>
              </div>
              {maxUses === 'multi' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Máx. de usos</label>
                  <input
                    type="number"
                    min={2}
                    value={multiUses}
                    onChange={(e) => setMultiUses(Number(e.target.value))}
                    className="w-20 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                  />
                </div>
              )}
              <button
                onClick={handleCreateInvite}
                disabled={creatingInvite}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Gerar convite
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono font-bold">{invite.code}</span>
                    <button onClick={() => handleCopyCode(invite.code)} className="text-slate-500 hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {invite.usesCount}/{invite.maxUses ?? 1} usos · expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                    {' · '}
                    <span className={isInviteActive(invite) ? 'text-emerald-400' : 'text-red-400'}>
                      {isInviteActive(invite) ? 'ativo' : 'inativo'}
                    </span>
                  </p>
                </div>
                {isInviteActive(invite) && (
                  <button
                    onClick={() => handleRevokeInvite(invite.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    title="Revogar convite"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {invites.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">Nenhum convite criado ainda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
