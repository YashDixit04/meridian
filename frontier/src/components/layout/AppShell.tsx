/**
 * AppShell
 *
 * Wraps Navbar + Sidebar + the main content area in the same layout
 * that was previously inlined inside App.tsx. Children are rendered
 * inside the ErrorBoundary-wrapped page view pane.
 */

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface AppShellProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
  /** Current pathname used for the ErrorBoundary componentName label */
  pathname: string;
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({
  isDarkMode,
  toggleTheme,
  onLogout,
  onNavigate,
  activeTab,
  pathname,
  children,
}) => {
  return (
    <div className="h-screen overflow-hidden transition-colors duration-300 font-sans text-body flex flex-col bg-grey-50 dark:bg-grey-50">
      <ErrorBoundary componentName="Navigation Bar">
        <Navbar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />
      </ErrorBoundary>

      <div className="flex flex-1 overflow-hidden max-w-[1920px] mx-auto w-full">
        <ErrorBoundary componentName="Sidebar Menu">
          <Sidebar
            isDarkMode={isDarkMode}
            activeTab={activeTab}
            onTabChange={onNavigate}
          />
        </ErrorBoundary>

        <ErrorBoundary componentName={`Page View (${pathname})`}>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AppShell;
