import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './i18n';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ScopeProvider } from './contexts/ScopeContext.tsx';
import { ActiveOrganizationProvider } from './contexts/ActiveOrganizationContext.tsx';
import { ToastProvider } from './shared/components/Toast.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScopeProvider>
            <ActiveOrganizationProvider>
              <App />
            </ActiveOrganizationProvider>
          </ScopeProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
