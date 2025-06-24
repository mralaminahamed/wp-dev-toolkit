import React, { useState, useEffect } from 'react';
import { Button, Spinner, Card, CardBody, CardHeader } from '@wordpress/components';
import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';

const ErrorLog: React.FC = () => {
  const { errorLog } = useWPDevToolkit();
  const [logContent, setLogContent] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchErrorLog();
  }, []);

  const fetchErrorLog = async () => {
    setIsFetching(true);
    try {
      const content = await errorLog.get();
      setLogContent(content || 'No errors logged.');
    } catch (error) {
      console.error('Error fetching error log:', error);
      setLogContent('Failed to fetch error log.');
    }
    setIsFetching(false);
  };

  const clearErrorLog = async () => {
    if (!confirm('Are you sure you want to clear the error log?')) {
      return;
    }

    setIsClearing(true);
    try {
      await errorLog.clear();
      setLogContent('Error log cleared successfully.');
    } catch (error) {
      console.error('Error clearing error log:', error);
      setLogContent('Failed to clear error log.');
    }
    setIsClearing(false);
  };

  return (
    <div className="wp-dev-toolkit-error-log">
      <h2 className="text-xl font-semibold mb-4">Error Log</h2>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Log Content</h3>
            <div className="space-x-2">
              <Button
                isPrimary
                onClick={fetchErrorLog}
                isBusy={isFetching}
                disabled={isFetching || isClearing}
              >
                Refresh
              </Button>
              <Button
                isSecondary
                onClick={clearErrorLog}
                isBusy={isClearing}
                disabled={isFetching || isClearing}
              >
                Clear Log
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isFetching ? (
            <div className="flex justify-center items-center p-4">
              <Spinner /> <span className="ml-2">Loading error log...</span>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded">
              <pre className="whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                {logContent}
              </pre>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Log Settings</h3>
        </CardHeader>
        <CardBody>
          <p className="mb-4">
            The error log captures PHP errors, warnings, and notices based on your WordPress and PHP configurations.
          </p>
          <p className="text-sm text-gray-600">
            Log file location: <code className="bg-gray-100 px-1 py-0.5 rounded">{window.wpDevToolkit?.logPath || 'wp-content/wp-dev-toolkit-error.log'}</code>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default ErrorLog;
