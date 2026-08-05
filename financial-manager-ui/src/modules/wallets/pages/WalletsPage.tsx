import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet as WalletIcon, CreditCard, Banknote, Building2, Star, Trash2 } from 'lucide-react';
import { CreateWalletModal } from '../components/CreateWalletModal';
import { UpdateWalletModal } from '../components/UpdateWalletModal';
import { CreateTransferModal } from '../../transactions/components/CreateTransferModal';
import { ArrowRightLeft } from 'lucide-react';
import { ConfirmDangerModal } from '../../../shared/components/ConfirmDangerModal';
import { useToast } from '../../../shared/components/useToast';
import { useWallets, type Wallet } from '../hooks/useWallets';
import { useSavingsGoals } from '../../savings-goals/hooks/useSavingsGoals';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { OrganizationFilterSelect } from '../../organizations/components/OrganizationFilterSelect';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const WalletsPage = () => {
  const { showToast } = useToast();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const { wallets, loading, loadWallets, setPrimaryWallet, clearAllWallets, moveWalletToOrganization } = useWallets(scope);
  const { clearAllGoals } = useSavingsGoals();
  const { organizations, loadOrganizations } = useOrganizations();
  const visibleWallets = scope === 'business'
    ? wallets.filter((wallet) => wallet.organizationId === activeOrganizationId)
    : wallets;
  // "Zerar tudo" precisa saber exatamente o que está limpando: no escopo empresarial, só faz
  // sentido com uma organização específica selecionada (sem isso, ficaria ambíguo qual
  // organização apagar) — sem essa checagem, o botão sempre limpava os dados PESSOAIS do
  // usuário, mesmo estando na aba Empresarial.
  const canClearAll = scope === 'personal' || !!activeOrganizationId;
  const clearAllTarget = scope === 'business' ? (activeOrganizationId ?? undefined) : undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [movingWalletId, setMovingWalletId] = useState<string | null>(null);

  useEffect(() => {

    loadWallets().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar carteiras'), 'error'));
    loadOrganizations().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const handleMoveToOrganization = async (e: React.MouseEvent, walletId: string, organizationId: string) => {
    e.stopPropagation();
    if (!organizationId) return;

    try {
      await moveWalletToOrganization(walletId, organizationId);
      setMovingWalletId(null);
      await loadWallets();
      showToast('Carteira movida para a organização com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao mover carteira'), 'error');
    }
  };

  const handleEdit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setIsUpdateModalOpen(true);
  };

  const handleSetPrimary = async (e: React.MouseEvent, wallet: Wallet) => {
    e.stopPropagation();
    if (wallet.isPrimary) return;

    try {
      await setPrimaryWallet(wallet.id);
      await loadWallets();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao definir carteira principal'), 'error');
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'credit': return <CreditCard className="w-6 h-6" />;
      case 'savings': return <Banknote className="w-6 h-6" />;
      default: return <WalletIcon className="w-6 h-6" />;
    }
  };

  const handleClearWallets = async () => {
    try {
      await clearAllWallets(clearAllTarget);
      setIsClearAllModalOpen(false);
      loadWallets();
      showToast('Carteiras removidas com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao excluir carteiras'), 'error');
    }
  };

  const handleResetEverything = async () => {
    try {
      await clearAllWallets(clearAllTarget);
      if (scope === 'personal') await clearAllGoals();
      setIsClearAllModalOpen(false);
      loadWallets();
      showToast('Todos os dados foram removidos', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao zerar tudo'), 'error');
    }
  };

  const getWalletGradient = (type: string) => {
    switch (type) {
      case 'credit': return 'from-app-accent to-app-accent';
      case 'savings': return 'from-emerald-600 to-teal-600';
      case 'investment': return 'from-amber-500 to-orange-600';
      default: return 'from-app-accent to-app-accent';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">Minhas Carteiras</h1>
          <p className="text-app-muted">Gerencie seu dinheiro em diferentes contas</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {scope === 'business' && <OrganizationFilterSelect organizations={organizations} />}
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="bg-app-surface hover:bg-app-surface-2 text-app-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all border border-app-border active:scale-95"
          >
            <ArrowRightLeft className="w-5 h-5 text-app-accent" />
            Transferir
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-app-accent hover:opacity-90 text-app-accent-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-app-card"
          >
            <Plus className="w-5 h-5" />
            Nova Carteira
          </button>
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            disabled={!canClearAll}
            className="bg-app-surface hover:bg-red-500/10 text-app-ink hover:text-red-400 p-3 rounded-2xl border border-app-border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-app-surface disabled:hover:text-app-ink"
            title={canClearAll ? 'Excluir carteiras' : 'Selecione uma organização específica para limpar os dados dela'}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-app-surface border border-app-border rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {visibleWallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleEdit(wallet)}
                className={`relative group h-48 p-6 rounded-3xl border border-app-border bg-gradient-to-br ${getWalletGradient(wallet.type)} shadow-app-card overflow-hidden cursor-pointer`}
              >
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-black/15 rounded-2xl text-app-accent-ink">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleSetPrimary(e, wallet)}
                        title={wallet.isPrimary ? 'Carteira principal' : 'Definir como principal'}
                        className="p-2 hover:bg-app-surface-2 rounded-lg transition-colors"
                      >
                        <Star className={`w-5 h-5 ${wallet.isPrimary ? 'text-yellow-300 fill-yellow-300' : 'text-app-ink/70'}`} />
                      </button>
                      {!wallet.organizationId && organizations.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMovingWalletId((prev) => (prev === wallet.id ? null : wallet.id));
                          }}
                          title="Mover para organização"
                          className="p-2 hover:bg-app-surface-2 rounded-lg transition-colors"
                        >
                          <Building2 className="w-5 h-5 text-app-ink/70" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-app-ink/60 text-sm font-medium mb-1 uppercase tracking-wider flex items-center gap-2">
                      {wallet.name}
                      {wallet.isPrimary && (
                        <span className="ledger-stamp text-app-ink/80">
                          Principal
                        </span>
                      )}
                      {wallet.organizationId && (
                        <span className="ledger-stamp text-app-ink/80">
                          {organizations.find((organization) => organization.id === wallet.organizationId)?.name ?? 'Organização'}
                        </span>
                      )}
                    </p>
                    <h2 className="ledger-figure text-3xl text-app-ink">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                    </h2>
                  </div>

                  {movingWalletId === wallet.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center gap-3 p-4 z-10"
                    >
                      <p className="text-app-ink text-sm font-medium text-center">Mover "{wallet.name}" para qual organização?</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {organizations.map((organization) => (
                          <button
                            key={organization.id}
                            onClick={(e) => handleMoveToOrganization(e, wallet.id, organization.id)}
                            className="bg-app-accent hover:opacity-90 text-app-ink text-xs font-bold px-3 py-2 rounded-xl"
                          >
                            {organization.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setMovingWalletId(null); }}
                        className="text-app-ink/70 text-xs hover:text-app-ink"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>

          {visibleWallets.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-app-border rounded-3xl">
              <div className="p-4 bg-app-surface-2 rounded-full mb-4">
                <WalletIcon className="w-12 h-12 text-app-muted" />
              </div>
              <p className="text-app-muted font-medium text-lg">Nenhuma carteira cadastrada.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-app-accent hover:opacity-80 font-bold"
              >
                Clique aqui para criar a primeira
              </button>
            </div>
          )}
        </div>
      )}

      <CreateWalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadWallets}
      />

      <CreateTransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={loadWallets}
      />

      <UpdateWalletModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={loadWallets}
        wallet={selectedWallet}
      />

      <ConfirmDangerModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        title={scope === 'business' ? 'Excluir carteiras da organização' : 'Excluir carteiras pessoais'}
        warning={
          scope === 'business'
            ? `Isso remove as carteiras, transações e recorrências da organização "${organizations.find((organization) => organization.id === activeOrganizationId)?.name ?? ''}" — não afeta seus dados pessoais. Não tem como desfazer.`
            : 'Isso remove suas carteiras, transações e recorrências pessoais — não afeta nenhuma organização. Não tem como desfazer.'
        }
        actions={[
          {
            label: scope === 'business' ? 'Excluir carteiras da organização' : 'Excluir carteiras pessoais',
            description: 'Remove todas as carteiras, transações e recorrências deste escopo. Metas de economia continuam.',
            onClick: handleClearWallets,
          },
          {
            label: 'Zerar tudo',
            description: scope === 'business'
              ? 'Remove carteiras, transações e recorrências da organização.'
              : 'Remove carteiras, transações, recorrências e também todas as suas metas de economia.',
            onClick: handleResetEverything,
          },
        ]}
      />
    </div>
  );
};
