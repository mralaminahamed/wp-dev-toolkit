import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router';

import ErrorBoundary from '@/components/ErrorBoundary';
import RootLayout from '@/components/RootLayout';

import Dashboard from '@/pages/Dashboard';
import ErrorLog from '@/pages/ErrorLog';
import HookInspector from '@/pages/HookInspector';
import QueryMonitor from '@/pages/QueryMonitor';
import Settings from '@/pages/Settings';
import SystemInfo from '@/pages/SystemInfo';
import TailwindTest from '@/pages/TailwindTest';
import Terminal from '@/pages/Terminal';

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

const App: React.FC = () => {
	// Create router with routes configuration
	const router = createHashRouter( [
		{
			path: '/',
			element: <RootLayout />,
			errorElement: <ErrorBoundary />,

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
				{ path: '*', element: <Dashboard /> },
			],
		},
	] );

	return <RouterProvider router={ router } />;
};

export default App;
