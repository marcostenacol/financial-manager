import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { ProfilePage } from '../modules/profile/pages/ProfilePage';
import { WalletsPage } from '../modules/wallets/pages/WalletsPage';
import { TransactionsPage } from '../modules/transactions/pages/TransactionsPage';
import { CategoriesPage } from '../modules/categories/pages/CategoriesPage';
import { RecurrencesPage } from '../modules/recurrences/pages/RecurrencesPage';
import { DashboardPage } from '../modules/reports/pages/DashboardPage';
import { SavingsGoalsPage } from '../modules/savings-goals/pages/SavingsGoalsPage';
import { CostCentersPage } from '../modules/cost-centers/pages/CostCentersPage';
import { OrganizationsPage } from '../modules/organizations/pages/OrganizationsPage';
import { DefaultLayout } from '../shared/components/Layout/DefaultLayout';

// Pages (Placeholders por enquanto)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-app-ink">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;

  return <DefaultLayout>{children}</DefaultLayout>;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/wallets" 
        element={
          <ProtectedRoute>
            <WalletsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/categories" 
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/recurrences" 
        element={
          <ProtectedRoute>
            <RecurrencesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/savings-goals" 
        element={
          <ProtectedRoute>
            <SavingsGoalsPage />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/cost-centers"
        element={
          <ProtectedRoute>
            <CostCentersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <OrganizationsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
