import React, { useState, useEffect } from 'react';
import { Button, TextareaControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ErrorLog: React.FC = () => {
  const [logContent, setLogContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchErrorLog();
  }, []);

  const fetchErrorLog = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch({ path: 'wp-dev-toolkit/v1/error-log' });
      setLogContent(response.log_content || 'No errors logged.');
    } catch (error) {
      console.error('Error fetching error log:', error);
      setLogContent('Failed to fetch error log.');
    }
    setIsLoading(false);
  };

  const clearErrorLog = async () => {
    setIsLoading(true);
    try {
      await apiFetch({
        path: 'wp-dev-toolkit/v1/error-log',
        method: 'DELETE',
      });
      setLogContent('Error log cleared.');
    } catch (error) {
      console.error('Error clearing error log:', error);
      setLogContent('Failed to clear error log.');
    }
    setIsLoading(false);
  };

  return (
    <div className="wp-dev-toolkit-error-log">
      <h2 className="text-xl font-semibold mb-4">Error Log</h2>
      <div className="mb-4">
        <TextareaControl
          value={logContent}
          readOnly
          rows={20}
          className="w-full font-mono text-sm"
        />
      </div>
      <div className="space-x-4">
        <Button isPrimary onClick={fetchErrorLog} disabled={isLoading}>
          Refresh
        </Button>
        <Button isSecondary onClick={clearErrorLog} disabled={isLoading}>
          Clear Log
        </Button>
      </div>
    </div>
  );
};

export default ErrorLog;