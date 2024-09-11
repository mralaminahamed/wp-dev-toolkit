// src/App.tsx
import React from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@wordpress/components';
import Dashboard from './components/Dashboard';
import ErrorLog from './components/ErrorLog';
import QueryMonitor from './components/QueryMonitor';
import HookInspector from './components/HookInspector';

const App: React.FC = () => {
  return (
    <div className="wp-dev-toolkit-app">
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/error-log">Error Log</Link></li>
          <li><Link to="/query-monitor">Query Monitor</Link></li>
          <li><Link to="/hook-inspector">Hook Inspector</Link></li>
        </ul>
      </nav>

      <Card>
        <CardHeader>
          <h1>WordPress Development Toolkit</h1>
        </CardHeader>
        <CardBody>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/error-log" component={ErrorLog} />
            <Route path="/query-monitor" component={QueryMonitor} />
            <Route path="/hook-inspector" component={HookInspector} />
          </Switch>
        </CardBody>
      </Card>
    </div>
  );
};

export default App;