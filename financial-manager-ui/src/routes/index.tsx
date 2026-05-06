import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { ProfilePage } from '../modules/profile/pages/ProfilePage';
import { DefaultLayout } from '../shared/components/Layout/DefaultLayout';

// Pages (Placeholders por enquanto)
const Dashboard = () => <div className="p-8 text-white">Dashboard Page (Coming Soon)</div>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Carregando...</div>;
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
            <Dashboard />
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
