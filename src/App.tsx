import { Card, CardBody, CardHeader } from '@wordpress/components';
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Dashboard from '@/components/Dashboard';
import ErrorLog from '@/components/ErrorLog';
import HookInspector from '@/components/HookInspector';
import QueryMonitor from '@/components/QueryMonitor';
import Settings from '@/components/Settings';
import Terminal from '@/components/Terminal';

const App: React.FC = () => {
  const tabs = [
    { name: 'dashboard', title: 'Dashboard', component: Dashboard },
    { name: 'error-log', title: 'Error Log', component: ErrorLog },
    { name: 'query-monitor', title: 'Query Monitor', component: QueryMonitor },
    { name: 'hook-inspector', title: 'Hook Inspector', component: HookInspector },
    { name: 'terminal', title: 'Terminal', component: Terminal },
    { name: 'settings', title: 'Settings', component: Settings },
  ];

  return (
    <Router>
      <div className="wp-dev-toolkit-app">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">WordPress Development Toolkit</h1>
          </CardHeader>
          <CardBody>
            <nav className="mb-4">
              <ul className="flex space-x-4">
                {tabs.map(tab => (
                  <li key={tab.name}>
                    <Link to={`/${tab.name}`} className="text-blue-500 hover:text-blue-700">
                      {tab.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {tabs.map(tab => (
                <Route key={tab.name} path={`/${tab.name}`} element={<tab.component />} />
              ))}
            </Routes>
          </CardBody>
        </Card>
      </div>
    </Router>
  );
};

export default App;
