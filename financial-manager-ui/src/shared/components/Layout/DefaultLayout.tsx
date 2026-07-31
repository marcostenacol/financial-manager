import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';

interface DefaultLayoutProps {
  children: ReactNode;
}

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="flex min-h-screen gap-4 bg-app-bg p-4">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto rounded-2xl bg-app-surface shadow-app-card pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};
