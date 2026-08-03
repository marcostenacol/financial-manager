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
import { useScope } from '../../../contexts/useScope';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const WalletsPage = () => {
  const { showToast } = useToast();
  const { scope } = useScope();
  const { wallets, loading, loadWallets, setPrimaryWallet, clearAllWallets, moveWalletToOrganization } = useWallets(scope);
  const { clearAllGoals } = useSavingsGoals();
  const { organizations, loadOrganizations } = useOrganizations();
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
      await clearAllWallets();
      setIsClearAllModalOpen(false);
      loadWallets();
      showToast('Carteiras removidas com sucesso', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao excluir carteiras'), 'error');
    }
  };

  const handleResetEverything = async () => {
    try {
      await clearAllWallets();
      await clearAllGoals();
      setIsClearAllModalOpen(false);
      loadWallets();
      showToast('Todos os dados foram removidos', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao zerar tudo'), 'error');
    }
  };

  const getWalletGradient = (type: string) => {
    switch (type) {
      case 'credit': return 'from-purple-600 to-indigo-600';
      case 'savings': return 'from-emerald-600 to-teal-600';
      case 'investment': return 'from-amber-500 to-orange-600';
      default: return 'from-blue-600 to-indigo-600';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-app-ink">Minhas Carteiras</h1>
          <p className="text-app-muted">Gerencie seu dinheiro em diferentes contas</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="bg-app-surface hover:bg-app-surface-2 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all border border-app-border active:scale-95"
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            Transferir
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-app-accent hover:opacity-90 text-app-accent-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            Nova Carteira
          </button>
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            className="bg-app-surface hover:bg-red-500/10 text-app-ink hover:text-red-400 p-3 rounded-2xl border border-app-border transition-all active:scale-95"
            title="Excluir carteiras"
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
            {wallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleEdit(wallet)}
                className={`relative group h-48 p-6 rounded-3xl border border-app-border bg-gradient-to-br ${getWalletGradient(wallet.type)} shadow-app-card overflow-hidden cursor-pointer`}
              >
                {/* Efeito de Vidro */}
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleSetPrimary(e, wallet)}
                        title={wallet.isPrimary ? 'Carteira principal' : 'Definir como principal'}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Star className={`w-5 h-5 ${wallet.isPrimary ? 'text-yellow-300 fill-yellow-300' : 'text-white/70'}`} />
                      </button>
                      {!wallet.organizationId && organizations.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMovingWalletId((prev) => (prev === wallet.id ? null : wallet.id));
                          }}
                          title="Mover para organização"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Building2 className="w-5 h-5 text-white/70" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider flex items-center gap-2">
                      {wallet.name}
                      {wallet.isPrimary && (
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] normal-case tracking-normal font-bold">
                          Principal
                        </span>
                      )}
                      {wallet.organizationId && (
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] normal-case tracking-normal font-bold">
                          Organização
                        </span>
                      )}
                    </p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                    </h2>
                  </div>

                  {movingWalletId === wallet.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center gap-3 p-4 z-10"
                    >
                      <p className="text-white text-sm font-medium text-center">Mover "{wallet.name}" para qual organização?</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {organizations.map((organization) => (
                          <button
                            key={organization.id}
                            onClick={(e) => handleMoveToOrganization(e, wallet.id, organization.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl"
                          >
                            {organization.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setMovingWalletId(null); }}
                        className="text-white/70 text-xs hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* Círculos Decorativos */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              </motion.div>
            ))}
          </AnimatePresence>

          {wallets.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-app-border rounded-3xl">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <WalletIcon className="w-12 h-12 text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium text-lg">Nenhuma carteira cadastrada.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 font-bold"
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
        title="Excluir carteiras"
        warning="Excluir uma carteira remove também todas as transações e recorrências vinculadas a ela — não tem como desfazer."
        actions={[
          {
            label: 'Excluir carteiras',
            description: 'Remove todas as suas carteiras, transações e recorrências. Metas de economia continuam.',
            onClick: handleClearWallets,
          },
          {
            label: 'Zerar tudo',
            description: 'Remove carteiras, transações, recorrências e também todas as metas de economia.',
            onClick: handleResetEverything,
          },
        ]}
      />
    </div>
  );
};
