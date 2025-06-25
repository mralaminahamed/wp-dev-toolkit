import React, { useEffect } from 'react';
import { createHashRouter, RouterProvider, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Dashicon } from '@wordpress/components';

import Dashboard from '@/components/Dashboard';
import ErrorLog from '@/components/ErrorLog';
import HookInspector from '@/components/HookInspector';
import QueryMonitor from '@/components/QueryMonitor';
import Settings from '@/components/Settings';
import SystemInfo from '@/components/SystemInfo';
import Terminal from '@/components/Terminal';
import TailwindTest from '@/components/TailwindTest';

// Extend Window interface to include our global object
declare global {
  interface Window {
    wpDevToolkit: {
      apiUrl: string;
      nonce: string;
      version: string;
      logPath?: string;
      debugMode?: boolean;
      pluginUrl?: string;
    };
    wpDevToolkitInitialRoute?: string;
  }
}

// Main navigation component
const MainNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const tabs = [
    { name: 'dashboard', title: 'Dashboard', icon: 'dashboard' },
    { name: 'error-log', title: 'Error Log', icon: 'warning' },
    { name: 'query-monitor', title: 'Query Monitor', icon: 'database' },
    { name: 'hook-inspector', title: 'Hook Inspector', icon: 'admin-plugins' },
    { name: 'terminal', title: 'Terminal', icon: 'editor-code' },
    { name: 'system-info', title: 'System Info', icon: 'info' },
    { name: 'tailwind-test', title: 'Tailwind Test', icon: 'admin-appearance' },
    { name: 'settings', title: 'Settings', icon: 'admin-settings' },
  ];

  return (
    <aside className="wp-dev-toolkit-sidebar">
      <div className="wp-dev-toolkit-logo">
        <img 
          src={`${window.wpDevToolkit?.pluginUrl || ''}assets/images/wp-dev-toolkit-icon.svg`} 
          alt="WP Dev Toolkit Logo" 
        />
        <h1>Dev Toolkit</h1>
      </div>
      <nav className="wp-dev-toolkit-nav">
        <ul>
          {tabs.map(tab => {
            const isActive = 
              (tab.name === 'dashboard' && (currentPath === '/' || currentPath === '/dashboard')) || 
              (tab.name !== 'dashboard' && currentPath === `/${tab.name}`);
            
            return (
              <li key={tab.name} className={isActive ? 'active' : ''}>
                <Link 
                  to={tab.name === 'dashboard' ? '/' : `/${tab.name}`} 
                  className={isActive ? 'active' : ''}
                >
                  <Dashicon icon={tab.icon as any} />
                  <span>{tab.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="wp-dev-toolkit-version">
        <span>v{window.wpDevToolkit?.version || '1.0.0'}</span>
      </div>
    </aside>
  );
};

// Root Layout Component
const RootLayout: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have an initial route from the server
    if (window.wpDevToolkitInitialRoute) {
      const route = window.wpDevToolkitInitialRoute === 'dashboard' ? '/' : `/${window.wpDevToolkitInitialRoute}`;
      console.log('Initializing with route:', route);
      // Navigate to the initial route
      navigate(route);
    }
  }, [navigate]);
  
  return (
    <div className="wp-dev-toolkit-app">
      <MainNavigation />
      <main className="wp-dev-toolkit-content">
        <div className="wp-dev-toolkit-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Create router with routes configuration
const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'error-log', element: <ErrorLog /> },
      { path: 'query-monitor', element: <QueryMonitor /> },
      { path: 'hook-inspector', element: <HookInspector /> },
      { path: 'terminal', element: <Terminal /> },
      { path: 'system-info', element: <SystemInfo /> },
      { path: 'tailwind-test', element: <TailwindTest /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <Dashboard /> }
    ]
  }
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
