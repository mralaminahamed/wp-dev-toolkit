
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { ToggleControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const Dashboard: React.FC = () => {
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    apiFetch({ path: 'wp-dev-toolkit/v1/dev-mode' }).then((response) => {
      setDevMode(response.dev_mode);
    });
  }, []);

  const toggleDevMode = () => {
    apiFetch({
      path: 'wp-dev-toolkit/v1/dev-mode',
      method: 'POST',
      data: { dev_mode: !devMode },
    }).then((response) => {
      setDevMode(response.dev_mode);
    });
  };

  return (
    <div className="wp-dev-toolkit-dashboard">
      <h2>Dashboard</h2>
      <ToggleControl
        label="Development Mode"
        checked={devMode}
        onChange={toggleDevMode}
      />
    </div>
  );
};

export default Dashboard;