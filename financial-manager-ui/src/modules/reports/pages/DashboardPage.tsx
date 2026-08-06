import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PieChart, Activity, Target, FileDown, FileSpreadsheet, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReports, type DashboardOverview, type ExpenseByCategory, type MonthlyEvolution, type CashFlowByCostCenter } from '../hooks/useReports';
import { useSavingsGoals } from '../../savings-goals/hooks/useSavingsGoals';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { OrganizationFilterSelect } from '../../organizations/components/OrganizationFilterSelect';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

// Recharts requires literal color strings, not CSS var() — keep these in sync with the
// CSS tokens in src/index.css (--success, --danger, --border, --muted, --surface).
const CHART_COLORS = {
  income: '#4ade80',
  expense: '#f28b74',
  grid: 'rgba(255,255,255,.1)',
  axis: '#94a3b8',
  tooltipBg: '#0f172a',
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { getOverview, getExpensesByCategory, getMonthlyEvolution, getCashFlowByCostCenter, exportReport } = useReports();
  const { goals: allGoals, loadGoals } = useSavingsGoals();
  const { organizations, loadOrganizations } = useOrganizations();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const organizationId = scope === 'business' ? (activeOrganizationId ?? undefined) : undefined;
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([]);
  const [cashFlowByCostCenter, setCashFlowByCostCenter] = useState<CashFlowByCostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [start_date, setStartDate] = useState<string>('');
  const [end_date, setEndDate] = useState<string>('');
  const [active_preset, setActivePreset] = useState('month');

  const goals = allGoals.slice(0, 3);

  const loadDashboardData = async () => {
    try {
      const range = {
        start_date: start_date || undefined,
        end_date: end_date || undefined,
      };

      const [overviewData, expensesData, evolutionData] = await Promise.all([
        getOverview(range, scope, organizationId),
        getExpensesByCategory(organizationId, range),
        getMonthlyEvolution(organizationId, range),
        scope === 'personal' ? loadGoals() : getCashFlowByCostCenter(organizationId, range).then(setCashFlowByCostCenter),
      ]);
      setOverview(overviewData);
      setExpensesByCategory(expensesData);
      setEvolution(evolutionData);
    } catch (err) {
      showToast(getErrorMessage(err, t('dashboard.errors.load')), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
    loadOrganizations().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start_date, end_date, scope, activeOrganizationId]);

  const handlePresetChange = (preset: string) => {
    setActivePreset(preset);
    const now = new Date();
    let start = '';
    const end = '';

    switch (preset) {
      case '7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'custom':
        return; // Don't update yet
    }

    setStartDate(start);
    setEndDate(end); // Empty means "until now" or default
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await exportReport(format, {
        start_date: start_date || undefined,
        end_date: end_date || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast(getErrorMessage(err, t('dashboard.errors.export')), 'error');
    }
  };

  const calculateChange = (current: number, last: number) => {
    if (last === 0) return 0;
    return ((current - last) / last) * 100;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-app-surface rounded-3xl" />)}
        </div>
        <div className="h-64 bg-app-surface rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">{t('dashboard.title')}</h1>
          <p className="text-app-muted">{t('dashboard.welcome')}</p>
        </div>

        {scope === 'business' && <OrganizationFilterSelect organizations={organizations} />}

        <div className="flex flex-wrap bg-app-surface p-1 rounded-2xl border border-app-border">
          {[
            { id: 'month', label: t('dashboard.periods.month') },
            { id: '7days', label: t('dashboard.periods.7days') },
            { id: '30days', label: t('dashboard.periods.30days') },
            { id: 'custom', label: t('dashboard.periods.custom') },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active_preset === preset.id
                  ? 'bg-app-accent text-app-accent-ink shadow-lg shadow-app-card'
                  : 'text-app-muted hover:text-app-ink'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-app-surface hover:bg-app-surface-2 text-app-ink px-4 py-2 rounded-xl text-sm font-bold border border-app-border flex items-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4 text-red-400" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-app-surface hover:bg-app-surface-2 text-app-ink px-4 py-2 rounded-xl text-sm font-bold border border-app-border flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Excel
          </button>
        </div>
      </div>

      {active_preset === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8 p-4 bg-app-surface border border-app-border rounded-2xl items-end"
        >
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-app-muted ml-1">{t('dashboard.filters.startDate')}</label>
            <input 
              type="date" 
              value={start_date}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-app-surface-2 border border-app-border rounded-xl px-4 py-2 text-app-ink text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-app-muted ml-1">{t('dashboard.filters.endDate')}</label>
            <input 
              type="date" 
              value={end_date}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-app-surface-2 border border-app-border rounded-xl px-4 py-2 text-app-ink text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/50"
            />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Saldo Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-app-accent to-app-accent p-6 rounded-3xl shadow-app-card relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-24 h-24" />
          </div>
          <p className="text-app-accent-ink font-medium mb-1">{t('dashboard.cards.totalBalance')}</p>
          <h2 className="ledger-figure text-4xl text-app-ink">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overview?.total_balance || 0)}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-app-accent-ink/80 text-sm">
            <Activity className="w-4 h-4" />
            <span>{t('dashboard.cards.updatedNow')}</span>
          </div>
        </motion.div>

        {/* Receitas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-app-surface border border-app-border shadow-app-card p-6 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            {overview && (
              <span className={`ledger-stamp ${
                calculateChange(overview.monthly_income, overview.last_month_income) >= 0 ? 'text-app-success' : 'text-app-danger'
              }`}>
                {calculateChange(overview.monthly_income, overview.last_month_income) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(calculateChange(overview.monthly_income, overview.last_month_income)).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-app-muted font-medium mb-1">{t('dashboard.cards.monthlyIncome')}</p>
          <h2 className="ledger-figure text-3xl text-app-ink">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overview?.monthly_income || 0)}
          </h2>
        </motion.div>

        {/* Despesas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-app-surface border border-app-border shadow-app-card p-6 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/20 rounded-2xl text-red-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            {overview && (
              <span className={`ledger-stamp ${
                calculateChange(overview.monthly_expense, overview.last_month_expense) <= 0 ? 'text-app-success' : 'text-app-danger'
              }`}>
                {calculateChange(overview.monthly_expense, overview.last_month_expense) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(calculateChange(overview.monthly_expense, overview.last_month_expense)).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-app-muted font-medium mb-1">{t('dashboard.cards.monthlyExpense')}</p>
          <h2 className="ledger-figure text-3xl text-app-ink">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overview?.monthly_expense || 0)}
          </h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gastos por Categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="ledger-rules bg-app-surface border border-app-border shadow-app-card p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="ledger-title text-2xl text-app-ink flex items-center gap-2">
              <PieChart className="w-5 h-5 text-app-accent" />
              {t('dashboard.charts.expensesByCategory')}
            </h3>
          </div>

          <div className="space-y-6">
            {expensesByCategory.map((item, index) => (
              <div key={item.category_name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-app-ink font-medium">{item.category_name}</span>
                  <span className="ledger-figure text-app-muted">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                    <span className="ml-2 text-app-muted text-xs">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-app-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
            
            {expensesByCategory.length === 0 && (
              <div className="text-center py-12 text-app-muted">
                {t('dashboard.empty.noExpenses')}
              </div>
            )}
          </div>
        </motion.div>

        {/* Evolução Mensal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-app-surface border border-app-border shadow-app-card p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="ledger-title text-2xl text-app-ink flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-app-accent" />
              {t('dashboard.charts.monthlyEvolution')}
            </h3>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis 
                  dataKey="month_name" 
                  stroke={CHART_COLORS.axis} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke={CHART_COLORS.axis} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: CHART_COLORS.tooltipBg, 
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '16px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke={CHART_COLORS.income}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name={t('common.income')}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke={CHART_COLORS.expense}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name={t('common.expense')}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {scope === 'personal' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="ledger-rules mt-8 bg-app-surface border border-app-border shadow-app-card p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="ledger-title text-2xl text-app-ink flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              {t('dashboard.goals.title')}
            </h3>
            <Link to="/savings-goals" className="text-app-accent hover:opacity-80 text-sm font-medium transition-colors">
              {t('dashboard.goals.viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {goals.map((goal) => {
              const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              return (
                <div key={goal.id} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-app-ink font-bold">{goal.name}</p>
                      <p className="text-app-muted text-xs">{t('dashboard.goals.remaining', { amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount - goal.currentAmount) })}</p>
                    </div>
                    <span className="text-app-ink font-bold text-lg">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-app-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color, boxShadow: `0 0 15px ${goal.color}40` }}
                    />
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div className="col-span-full text-center py-4 text-app-muted">
                {t('dashboard.empty.noGoals')}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="ledger-rules mt-8 bg-app-surface border border-app-border shadow-app-card p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="ledger-title text-2xl text-app-ink flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              {t('dashboard.costCenters.title')}
            </h3>
            <Link to="/cost-centers" className="text-app-accent hover:opacity-80 text-sm font-medium transition-colors">
              {t('dashboard.costCenters.manage')}
            </Link>
          </div>

          <div className="space-y-6">
            {cashFlowByCostCenter.map((item, index) => (
              <div key={item.cost_center_name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-app-ink font-medium">{item.cost_center_name}</span>
                  <span className="ledger-figure text-app-muted">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                    <span className="ml-2 text-app-muted text-xs">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-app-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}

            {cashFlowByCostCenter.length === 0 && (
              <div className="text-center py-12 text-app-muted">
                {t('dashboard.empty.noCostCenterExpenses')}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
