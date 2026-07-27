import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PieChart, Activity, Target, FileDown, FileSpreadsheet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../../services/api';
import { useToast } from '../../../shared/components/useToast';

interface DashboardOverview {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  last_month_income: number;
  last_month_expense: number;
}

interface ExpenseByCategory {
  category_name: string;
  color: string;
  total: number;
  percentage: number;
}

interface MonthlyEvolution {
  month_name: string;
  income: number;
  expense: number;
  balance: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
}

export const DashboardPage = () => {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [start_date, setStartDate] = useState<string>('');
  const [end_date, setEndDate] = useState<string>('');
  const [active_preset, setActivePreset] = useState('month');

  const loadDashboardData = async () => {
    try {
      const params = {
        start_date: start_date || undefined,
        end_date: end_date || undefined,
      };

      const [overviewRes, expensesRes, evolutionRes, goalsRes] = await Promise.all([
        api.get('/reports/overview', { params }),
        api.get('/reports/expenses-by-category'),
        api.get('/reports/evolution'),
        api.get('/savings-goals'),
      ]);
      setOverview(overviewRes.data.data);
      setExpensesByCategory(expensesRes.data.data);
      setEvolution(evolutionRes.data.data);
      setGoals(goalsRes.data.data.slice(0, 3));
    } catch {
      showToast('Erro ao carregar dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start_date, end_date]);

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
      const response = await api.get('/reports/export', {
        params: {
          format,
          start_date: start_date || undefined,
          end_date: end_date || undefined,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      showToast('Erro ao exportar', 'error');
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
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Bem-vindo de volta! Aqui está o resumo das suas finanças.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {[
            { id: 'month', label: 'Este Mês' },
            { id: '7days', label: '7 dias' },
            { id: '30days', label: '30 dias' },
            { id: 'custom', label: 'Personalizado' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active_preset === preset.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 flex items-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4 text-red-400" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 flex items-center gap-2 transition-all"
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
          className="flex gap-4 mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl items-end"
        >
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Início</label>
            <input 
              type="date" 
              value={start_date}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Fim</label>
            <input 
              type="date" 
              value={end_date}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Saldo Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-900/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-24 h-24" />
          </div>
          <p className="text-blue-100 font-medium mb-1">Saldo Total</p>
          <h2 className="text-3xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overview?.total_balance || 0)}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-blue-100/80 text-sm">
            <Activity className="w-4 h-4" />
            <span>Atualizado agora</span>
          </div>
        </motion.div>

        {/* Receitas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            {overview && (
              <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                calculateChange(overview.monthly_income, overview.last_month_income) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {calculateChange(overview.monthly_income, overview.last_month_income) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(calculateChange(overview.monthly_income, overview.last_month_income)).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-slate-400 font-medium mb-1">Receitas do Mês</p>
          <h2 className="text-2xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overview?.monthly_income || 0)}
          </h2>
        </motion.div>

        {/* Despesas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/20 rounded-2xl text-red-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            {overview && (
              <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                calculateChange(overview.monthly_expense, overview.last_month_expense) <= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {calculateChange(overview.monthly_expense, overview.last_month_expense) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(calculateChange(overview.monthly_expense, overview.last_month_expense)).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-slate-400 font-medium mb-1">Despesas do Mês</p>
          <h2 className="text-2xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overview?.monthly_expense || 0)}
          </h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gastos por Categoria */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Gastos por Categoria
            </h3>
          </div>

          <div className="space-y-6">
            {expensesByCategory.map((item, index) => (
              <div key={item.category_name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">{item.category_name}</span>
                  <span className="text-slate-400 font-mono">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                    <span className="ml-2 text-slate-500 text-xs">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
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
              <div className="text-center py-12 text-slate-500">
                Sem despesas registradas este mês.
              </div>
            )}
          </div>
        </motion.div>

        {/* Evolução Mensal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Evolução Mensal
            </h3>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="month_name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #ffffff10',
                    borderRadius: '16px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  name="Receita"
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  name="Despesa"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Metas de Economia - Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Progresso das Metas
          </h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            Ver todas as metas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {goals.map((goal) => {
            const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            return (
              <div key={goal.id} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white font-bold">{goal.name}</p>
                    <p className="text-slate-500 text-xs">Faltam {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount - goal.currentAmount)}</p>
                  </div>
                  <span className="text-white font-bold text-lg">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
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
            <div className="col-span-full text-center py-4 text-slate-500">
              Você ainda não definiu metas de economia.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
