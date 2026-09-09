import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { ScopeBanner } from '../ScopeBanner';

interface DefaultLayoutProps {
  children: ReactNode;
}

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar />
      <main className="ledger-spine flex-1 min-w-0 overflow-y-auto bg-app-surface pt-16 md:pt-0">
        <ScopeBanner />
        {children}
      </main>
    </div>
  );
};
