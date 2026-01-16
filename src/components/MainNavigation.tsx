import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dashicon } from '@wordpress/components';

interface NavigationTab {
  name: string;
  title: string;
  icon: string;
}

const MainNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs: NavigationTab[] = [
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
    <aside className="wdt:flex wdt:flex-col wdt:w-60 wdt:min-w-60 wdt:h-full wdt:border-r wdt:border-gray-200 wdt:bg-white">
      <div className="wdt:flex wdt:items-center wdt:gap-3 wdt:p-4 wdt:border-b wdt:border-gray-200">
        <img src={`${window.wpDevToolkit?.pluginUrl || ''}assets/images/wp-dev-toolkit-icon.svg`} alt="WP Dev Toolkit Logo" className="wdt:w-8 wdt:h-8" />
        <h1 className="wdt:text-lg wdt:font-medium wdt:text-primary">Dev Toolkit</h1>
      </div>

      <nav className="wdt:flex-1 wdt:p-2 wdt:pb-2 wdt:overflow-auto">
        <ul className="wdt:flex wdt:flex-col wdt:gap-1">
          {tabs.map(tab => {
            const isActive = (tab.name === 'dashboard' && (currentPath === '/' || currentPath === '/dashboard')) || (tab.name !== 'dashboard' && currentPath === `/${tab.name}`);

            return (
              <li key={tab.name} className="wdt:relative">
                {isActive && <div className="wdt:absolute wdt:left-0 wdt:top-0 wdt:h-full wdt:w-1 wdt:bg-blue-600 wdt:rounded-r"></div>}
                <Link
                  to={tab.name === 'dashboard' ? '/' : `/${tab.name}`}
                  className={`wdt:flex wdt:items-center wdt:gap-3 wdt:px-4 wdt:py-3 wdt:text-gray-700 wdt:no-underline wdt:rounded-md wdt:transition-all wdt:duration-150 ${
                    isActive ? 'wdt:bg-blue-50 wdt:text-blue-700' : 'wdt:hover:bg-gray-50 wdt:hover:text-blue-600'
                  }`}
                >
                  <Dashicon icon={tab.icon as any} className="wdt:text-current" />
                  <span className="wdt:font-medium">{tab.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="wdt:p-4 wdt:text-center wdt:text-sm wdt:text-gray-500 wdt:border-t wdt:border-gray-200">
        <span>v{window.wpDevToolkit?.version || '1.0.0'}</span>
      </div>
    </aside>
  );
};

export default MainNavigation;
