import {
  FileText,
  Database,
  Link as LinkIcon,
  Terminal,
  Info,
  Settings,
} from 'lucide-react';
import React from 'react';

import DashboardHeader from './Dashboard/DashboardHeader';
import StatsCards from './Dashboard/StatsCards';
import ToolsGrid from './Dashboard/ToolsGrid';

const Dashboard: React.FC = () => {
  const tools = [
    {
      id: 'error-log',
      name: 'Error Log',
      description: 'Monitor PHP errors and exceptions',
      icon: FileText,
      status: 'active',
    },
    {
      id: 'query-monitor',
      name: 'Query Monitor',
      description: 'Track database queries and performance',
      icon: Database,
      status: 'active',
    },
    {
      id: 'hook-inspector',
      name: 'Hook Inspector',
      description: 'Inspect WordPress hooks and filters',
      icon: LinkIcon,
      status: 'active',
    },
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'Command-line interface for WordPress',
      icon: Terminal,
      status: 'active',
    },
    {
      id: 'system-info',
      name: 'System Info',
      description: 'Server and WordPress system information',
      icon: Info,
      status: 'active',
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Configure WP Dev Toolkit options',
      icon: Settings,
      status: 'available',
    },
  ];

  return (
    <div className='wdt:min-h-screen wdt:bg-gradient-to-br wdt:from-background wdt:via-background wdt:to-muted/20 wdt:p-6 lg:wdt:p-8'>
      <div className='wdt:max-w-7xl wdt:mx-auto wdt:space-y-8'>
        <DashboardHeader />

        <StatsCards
          activeToolsCount={tools.filter((t) => t.status === 'active').length}
        />

        <ToolsGrid tools={tools} />
      </div>
    </div>
  );
};

export default Dashboard;
