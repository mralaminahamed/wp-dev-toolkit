// src/components/ErrorLog.tsx
import React, { useState, useEffect } from 'react';
import { Button, TextareaControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ErrorLog: React.FC = () => {
  const [logContent, setLogContent] = useState('');

  const fetchErrorLog = () => {
    apiFetch({ path: 'wp-dev-toolkit/v1/error-log' }).then((response) => {
      setLogContent(response.log_content || 'No errors logged.');
    });
  };

  const clearErrorLog = () => {
    apiFetch({
      path: 'wp-dev-toolkit/v1/error-log',
      method: 'DELETE',
    }).then(() => {
      setLogContent('');
    });
  };

  useEffect(() => {
    fetchErrorLog();
  }, []);

  return (
    <div className="wp-dev-toolkit-error-log">
      <h2>Error Log</h2>
      <TextareaControl
        value={logContent}
        readOnly
        rows={20}
      />
      <Button isPrimary onClick={fetchErrorLog}>Refresh</Button>
      <Button isSecondary onClick={clearErrorLog}>Clear Log</Button>
    </div>
  );
};

export default ErrorLog;

