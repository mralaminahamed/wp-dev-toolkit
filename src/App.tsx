import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
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

// Route initializer component
const RouteInitializer: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have an initial route from the server
    if (window.wpDevToolkitInitialRoute) {
      // Navigate to the initial route
      navigate(`/${window.wpDevToolkitInitialRoute}`);
    }
  }, [navigate]);
  
  return null;
};

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
          {tabs.map(tab => (
            <li key={tab.name} className={currentPath === `/${tab.name}` || (tab.name === 'dashboard' && currentPath === '/') ? 'active' : ''}>
              <NavLink 
                to={`/${tab.name}`} 
                className={({ isActive }) => isActive ? 'active' : ''}
                end={tab.name === 'dashboard'}
              >
                <Dashicon icon={tab.icon as any} />
                <span>{tab.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="wp-dev-toolkit-version">
        <span>v{window.wpDevToolkit?.version || '1.0.0'}</span>
      </div>
    </aside>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <RouteInitializer />
      <div className="wp-dev-toolkit-app">
        <MainNavigation />
        <main className="wp-dev-toolkit-content">
          <div className="wp-dev-toolkit-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/error-log" element={<ErrorLog />} />
              <Route path="/query-monitor" element={<QueryMonitor />} />
              <Route path="/hook-inspector" element={<HookInspector />} />
              <Route path="/terminal" element={<Terminal />} />
              <Route path="/system-info" element={<SystemInfo />} />
              <Route path="/tailwind-test" element={<TailwindTest />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
