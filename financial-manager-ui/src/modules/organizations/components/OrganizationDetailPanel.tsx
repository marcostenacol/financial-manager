import { useState, useEffect } from 'react';
import { Trash2, Plus, Ban, Copy, Crown } from 'lucide-react';
import { useOrganizations, type Organization, type Member, type Invite } from '../hooks/useOrganizations';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

interface OrganizationDetailPanelProps {
  organization: Organization;
  onOwnershipTransferred?: () => void;
}

export const OrganizationDetailPanel = ({ organization, onOwnershipTransferred }: OrganizationDetailPanelProps) => {
  const { showToast } = useToast();
  const { loadMembers, removeMember, transferOwnership, loadInvites, createInvite, revokeInvite, deleteInvite } = useOrganizations();
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

  const handleTransferOwnership = async (member: Member) => {
    if (!window.confirm(`Transferir a titularidade da organização para ${member.user.email}? Você passará a ser um membro comum.`)) return;
    try {
      await transferOwnership(organization.id, member.userId);
      await load();
      onOwnershipTransferred?.();
      showToast('Titularidade transferida com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao transferir titularidade'), 'error');
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

  const handleDeleteInvite = async (inviteId: string) => {
    if (!window.confirm('Excluir este convite definitivamente? O histórico de quem já usou também será apagado.')) return;
    try {
      await deleteInvite(organization.id, inviteId);
      await load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao excluir convite'), 'error');
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
    <div className="bg-app-surface-2 border border-app-border rounded-3xl p-6 space-y-8">
      <div>
        <h3 className="text-app-ink font-bold mb-4">Membros</h3>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-app-surface-2 border border-app-border rounded-2xl p-3">
              <div>
                <p className="text-app-ink text-sm font-medium">{member.user.email}</p>
                <span className="text-[10px] uppercase tracking-widest font-bold text-app-muted">{member.role === 'owner' ? 'Dono' : 'Membro'}</span>
              </div>
              {isOwner && member.role !== 'owner' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTransferOwnership(member)}
                    title="Transferir titularidade para este membro"
                    className="p-2 text-app-muted hover:text-amber-400 transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-2 text-app-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isOwner && (
        <div>
          <h3 className="text-app-ink font-bold mb-4">Convites</h3>

          <div className="bg-app-surface-2 border border-app-border rounded-2xl p-4 mb-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-app-muted">Validade</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="bg-app-surface-2 border border-app-border rounded-xl px-3 py-2 text-app-ink text-sm"
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-app-muted">Uso</label>
                <select
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value as 'single' | 'multi')}
                  className="bg-app-surface-2 border border-app-border rounded-xl px-3 py-2 text-app-ink text-sm"
                >
                  <option value="single">Único uso</option>
                  <option value="multi">Múltiplo uso</option>
                </select>
              </div>
              {maxUses === 'multi' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-app-muted">Máx. de usos</label>
                  <input
                    type="number"
                    min={2}
                    value={multiUses}
                    onChange={(e) => setMultiUses(Number(e.target.value))}
                    className="w-20 bg-app-surface-2 border border-app-border rounded-xl px-3 py-2 text-app-ink text-sm"
                  />
                </div>
              )}
              <button
                onClick={handleCreateInvite}
                disabled={creatingInvite}
                className="bg-app-accent hover:opacity-90 text-app-ink font-bold px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Gerar convite
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between bg-app-surface-2 border border-app-border rounded-2xl p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-app-ink font-mono font-bold">{invite.code}</span>
                    <button onClick={() => handleCopyCode(invite.code)} className="text-app-muted hover:text-app-ink">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-app-muted mt-1">
                    {invite.usesCount}/{invite.maxUses ?? 1} usos · expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                    {' · '}
                    <span className={isInviteActive(invite) ? 'text-emerald-400' : 'text-red-400'}>
                      {isInviteActive(invite) ? 'ativo' : 'inativo'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {isInviteActive(invite) && (
                    <button
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="p-2 text-app-muted hover:text-amber-400 transition-colors"
                      title="Revogar convite"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteInvite(invite.id)}
                    className="p-2 text-app-muted hover:text-red-400 transition-colors"
                    title="Excluir convite"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {invites.length === 0 && (
              <p className="text-app-muted text-sm text-center py-4">Nenhum convite criado ainda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
