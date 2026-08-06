import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  Wallet as WalletIcon,
  RefreshCw,
  ChevronRight,
  Download,
  Trash2
} from 'lucide-react';
import { CreateTransactionModal, type DuplicateTransactionData } from '../components/CreateTransactionModal';
import { UpdateTransactionModal } from '../components/UpdateTransactionModal';
import { AdvancedFiltersModal } from '../components/AdvancedFiltersModal';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { ConfirmDangerModal } from '../../../shared/components/ConfirmDangerModal';
import { useToast } from '../../../shared/components/useToast';
import { useTransactions, type Transaction } from '../hooks/useTransactions';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { OrganizationFilterSelect } from '../../organizations/components/OrganizationFilterSelect';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const TransactionsPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const { organizations, loadOrganizations } = useOrganizations();
  const { transactions, total, loading, loadTransactions, deleteTransaction, exportTransactions, clearAllTransactions } = useTransactions();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [duplicateData, setDuplicateData] = useState<DuplicateTransactionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Volta para a primeira página ao buscar
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = async () => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(filterType !== 'all' ? { type: filterType } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(scope === 'business' && activeOrganizationId ? { organization_id: activeOrganizationId } : {}),
        ...advancedFilters
      };

      await loadTransactions(params);
    } catch (err) {
      showToast(getErrorMessage(err, t('transactions.errors.load')), 'error');
    }
  };

  useEffect(() => {

    fetchTransactions();
    loadOrganizations().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, debouncedSearch, page, advancedFilters, scope, activeOrganizationId]);

  const handleExport = async () => {
    try {
      const blob = await exportTransactions();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transacoes.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast(getErrorMessage(err, t('transactions.errors.export')), 'error');
    }
  };

  const handleShowDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleEdit = () => {
    setIsDetailModalOpen(false);
    setIsUpdateModalOpen(true);
  };

  const handleDuplicate = () => {
    if (!selectedTransaction || selectedTransaction.type === 'transfer') return;

    setDuplicateData({
      description: selectedTransaction.description,
      amount: selectedTransaction.amount,
      type: selectedTransaction.type,
      walletId: selectedTransaction.walletId,
      categoryId: selectedTransaction.categoryId,
    });
    setIsDetailModalOpen(false);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (isDeleting || !selectedTransaction || !window.confirm(t('transactions.confirmDelete'))) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(selectedTransaction.id);
      setIsDetailModalOpen(false);
      fetchTransactions();
    } catch (err) {
      showToast(getErrorMessage(err, t('transactions.errors.delete')), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // "Limpar tudo" precisa saber exatamente o que está limpando: no escopo empresarial, só faz
  // sentido com uma organização específica selecionada — sem isso, o botão sempre limpava as
  // transações PESSOAIS do usuário, mesmo estando na aba Empresarial.
  const canClearAll = scope === 'personal' || !!activeOrganizationId;
  const clearAllTarget = scope === 'business' ? (activeOrganizationId ?? undefined) : undefined;

  const handleClearAll = async (resetBalances: boolean) => {
    try {
      await clearAllTransactions(resetBalances, clearAllTarget);
      setIsClearAllModalOpen(false);
      fetchTransactions();
      showToast(t('transactions.clearAll.successToast'), 'success');
    } catch (err) {
      showToast(getErrorMessage(err, t('transactions.errors.clearAll')), 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">{t('transactions.title')}</h1>
          <p className="text-app-muted">{t('transactions.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {scope === 'business' && <OrganizationFilterSelect organizations={organizations} />}
          <div className="bg-app-surface border border-app-border rounded-2xl p-1 flex items-center">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'all' ? 'bg-app-accent text-app-accent-ink shadow-lg' : 'text-app-muted hover:text-app-ink'}`}
            >
              {t('transactions.filters.all')}
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'income' ? 'bg-app-success text-app-ink shadow-lg' : 'text-app-muted hover:text-app-ink'}`}
            >
              {t('transactions.filters.income')}
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'expense' ? 'bg-app-danger text-app-ink shadow-lg' : 'text-app-muted hover:text-app-ink'}`}
            >
              {t('transactions.filters.expense')}
            </button>
          </div>

          <button
            onClick={handleExport}
            className="bg-app-surface hover:bg-app-surface-2 text-app-ink p-3 rounded-2xl border border-app-border transition-all active:scale-95"
            title={t('transactions.exportCsv')}
          >
            <Download className="w-6 h-6 text-app-accent" />
          </button>

          <button
            onClick={() => setIsClearAllModalOpen(true)}
            disabled={!canClearAll}
            className="bg-app-surface hover:bg-red-500/10 text-app-ink hover:text-red-400 p-3 rounded-2xl border border-app-border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-app-surface disabled:hover:text-app-ink"
            title={canClearAll ? t('transactions.clearAll.tooltip') : t('transactions.clearAll.tooltipDisabled')}
          >
            <Trash2 className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              setDuplicateData(null);
              setIsModalOpen(true);
            }}
            className="bg-app-accent hover:bg-app-accent/90 text-app-accent-ink p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-app-card"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Busca e Filtros Avançados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-muted" />
          <input
            type="text"
            placeholder={t('transactions.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-app-surface border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-app-accent/50 transition-all"
          />
        </div>
        <button
          onClick={() => setIsFiltersModalOpen(true)}
          className={`flex items-center justify-center gap-2 border rounded-2xl py-4 px-6 transition-all font-medium ${
            Object.keys(advancedFilters).length > 0
              ? 'bg-app-accent/20 border-app-accent text-app-accent'
              : 'bg-app-surface border-app-border text-app-muted hover:bg-app-surface-2'
          }`}
        >
          <Filter className="w-5 h-5" />
          {t('transactions.advancedFilters')}
          {Object.keys(advancedFilters).length > 0 && (
            <span className="w-5 h-5 bg-app-accent text-app-accent-ink text-[10px] rounded-full flex items-center justify-center">
              {Object.keys(advancedFilters).length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-app-surface backdrop-blur-xl border border-app-border rounded-3xl overflow-hidden shadow-app-card">
        <div className="px-6 py-4 border-b border-app-border flex items-center justify-between bg-app-surface-2">
          <span className="text-xs font-bold text-app-muted uppercase tracking-widest">
            {t('transactions.pagination.showing', { shown: transactions.length, total })}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl bg-app-surface border border-app-border text-app-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-app-surface-2 transition-all"
            >
              {t('transactions.pagination.previous')}
            </button>
            <span className="text-app-ink font-bold px-3 py-1 bg-app-accent/20 border border-app-accent/30 rounded-lg text-sm">
              {page}
            </span>
            <button
              disabled={page * perPage >= total || loading}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl bg-app-surface border border-app-border text-app-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-app-surface-2 transition-all"
            >
              {t('transactions.pagination.next')}
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-app-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="ledger-rules">
            <AnimatePresence>
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleShowDetail(transaction)}
                  className="ledger-item px-6 py-4 flex items-center justify-between group hover:bg-app-accent-soft transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-sm border ${transaction.type === 'income' ? 'border-app-success/40 bg-app-success/10 text-app-success' : 'border-app-danger/40 bg-app-danger/10 text-app-danger'}`}>
                      {transaction.type === 'income' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-app-ink font-bold group-hover:text-app-accent transition-colors">{transaction.description}</h3>
                        {transaction.recurrenceId && (
                          <span title={t('transactions.recurringBadge')}>
                            <RefreshCw className="w-3 h-3 text-app-accent" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-app-muted uppercase tracking-wider">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.occurredAt)}
                        </span>
                        <span className="w-px h-3 bg-app-border" />
                        <span className="flex items-center gap-1 text-xs text-app-muted uppercase tracking-wider">
                          <WalletIcon className="w-3 h-3" />
                          {transaction.wallet?.name || t('common.wallet')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className={`ledger-figure text-xl ${transaction.type === 'income' ? 'text-app-success' : 'text-app-danger'}`}>
                        {transaction.type === 'income' ? '+' : '−'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                      </p>
                      <span className={`ledger-stamp mt-1 ${
                        transaction.status === 'completed' ? 'text-app-success' : 'text-app-accent'
                      }`}>
                        {transaction.status === 'completed' ? t('transactions.status.completed') : t('transactions.status.pending')}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-app-muted group-hover:text-app-ink transition-colors" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {transactions.length === 0 && !loading && (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-app-surface rounded-full mb-4">
                  <ArrowUpCircle className="w-12 h-12 text-app-muted" />
                </div>
                <h3 className="text-app-ink font-bold text-lg">{t('transactions.empty.title')}</h3>
                <p className="text-app-muted mt-1 max-w-xs">{t('transactions.empty.description')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDuplicateData(null);
        }}
        onSuccess={fetchTransactions}
        initialData={duplicateData}
      />

      <UpdateTransactionModal 
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={fetchTransactions}
        transaction={selectedTransaction}
      />

      <AdvancedFiltersModal 
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setPage(1);
        }}
        currentFilters={advancedFilters}
      />

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        deleting={isDeleting}
        transaction={selectedTransaction}
      />

      <ConfirmDangerModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        title={scope === 'business' ? t('transactions.clearAll.titleBusiness') : t('transactions.clearAll.titlePersonal')}
        warning={
          scope === 'business'
            ? t('transactions.clearAll.warningBusiness')
            : t('transactions.clearAll.warningPersonal')
        }
        actions={[
          {
            label: t('transactions.clearAll.keepBalanceLabel'),
            description: t('transactions.clearAll.keepBalanceDescription'),
            onClick: () => handleClearAll(false),
          },
          {
            label: t('transactions.clearAll.resetBalanceLabel'),
            description: t('transactions.clearAll.resetBalanceDescription'),
            onClick: () => handleClearAll(true),
          },
        ]}
      />
    </div>
  );
};
