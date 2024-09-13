import { Card, CardBody, CardHeader, TabPanel } from '@wordpress/components';
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';

import Dashboard from '@/components/Dashboard';
import ErrorLog from '@/components/ErrorLog';
import HookInspector from '@/components/HookInspector';
import QueryMonitor from '@/components/QueryMonitor';

const App: React.FC = () => {
  const tabs = [
    {
      name: 'dashboard',
      title: 'Dashboard',
      className: 'tab-dashboard',
      component: Dashboard,
    },
    {
      name: 'error-log',
      title: 'Error Log',
      className: 'tab-error-log',
      component: ErrorLog,
    },
    {
      name: 'query-monitor',
      title: 'Query Monitor',
      className: 'tab-query-monitor',
      component: QueryMonitor,
    },
    {
      name: 'hook-inspector',
      title: 'Hook Inspector',
      className: 'tab-hook-inspector',
      component: HookInspector,
    },
  ];

  return (
    <Router>
      <div className="wp-dev-toolkit-app">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">WordPress Development Toolkit</h1>
          </CardHeader>
          <CardBody>
            <TabPanel
              className="wp-dev-toolkit-tab-panel"
              activeClass="active-tab"
              onSelect={(tabName: string) => {
                window.location.hash = tabName;
              }}
              tabs={tabs}
            >
              {tab => <tab.component />}
            </TabPanel>
          </CardBody>
        </Card>
      </div>
    </Router>
  );
};

export default App;
