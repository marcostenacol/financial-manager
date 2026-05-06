import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PieChart, Activity } from 'lucide-react';
import { api } from '../../../services/api';

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

export const DashboardPage = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [overviewRes, expensesRes] = await Promise.all([
        api.get('/reports/overview'),
        api.get('/reports/expenses-by-category'),
      ]);
      setOverview(overviewRes.data.data);
      setExpensesByCategory(expensesRes.data.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard', error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Bem-vindo de volta! Aqui está o resumo das suas finanças.</p>
      </div>

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

        {/* Placeholder para Evolução Mensal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-white font-bold text-lg">Evolução Mensal</h3>
          <p className="text-slate-500 text-sm max-w-[240px] mt-2">
            Em breve, visualize o crescimento do seu patrimônio ao longo do tempo.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
