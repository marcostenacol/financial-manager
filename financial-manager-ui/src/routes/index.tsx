import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { DefaultLayout } from '../shared/components/Layout/DefaultLayout';

const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../modules/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import('../modules/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const WalletsPage = lazy(() => import('../modules/wallets/pages/WalletsPage').then((m) => ({ default: m.WalletsPage })));
const TransactionsPage = lazy(() => import('../modules/transactions/pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const CategoriesPage = lazy(() => import('../modules/categories/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const RecurrencesPage = lazy(() => import('../modules/recurrences/pages/RecurrencesPage').then((m) => ({ default: m.RecurrencesPage })));
const DashboardPage = lazy(() => import('../modules/reports/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SavingsGoalsPage = lazy(() => import('../modules/savings-goals/pages/SavingsGoalsPage').then((m) => ({ default: m.SavingsGoalsPage })));
const CostCentersPage = lazy(() => import('../modules/cost-centers/pages/CostCentersPage').then((m) => ({ default: m.CostCentersPage })));
const OrganizationsPage = lazy(() => import('../modules/organizations/pages/OrganizationsPage').then((m) => ({ default: m.OrganizationsPage })));
const PeoplePage = lazy(() => import('../modules/people/pages/PeoplePage').then((m) => ({ default: m.PeoplePage })));
const CreditCardsPage = lazy(() => import('../modules/credit-cards/pages/CreditCardsPage').then((m) => ({ default: m.CreditCardsPage })));

const PageFallback = () => (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-app-ink">Carregando...</div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/login" />;

  return <DefaultLayout>{children}</DefaultLayout>;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
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

        <Route
          path="/people"
          element={
            <ProtectedRoute>
              <PeoplePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/credit-cards"
          element={
            <ProtectedRoute>
              <CreditCardsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};
