import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

import MainNavigation from '@/components/MainNavigation';

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
    <div className="wdt:flex wdt:h-screen wdt:bg-gray-50">
      <MainNavigation />
      <main className="wdt:flex-1 wdt:overflow-auto wdt:p-6">
        <div className="wdt:max-w-6xl wdt:mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
