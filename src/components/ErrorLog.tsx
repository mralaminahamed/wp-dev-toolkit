import React, { useState, useEffect } from 'react';
import { Button, Spinner, Card, CardBody, CardHeader, ToggleControl } from '@wordpress/components';
import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { ErrorLogResponse } from '@/types';

interface ParsedLogEntry {
  timestamp: string;
  level: string;
  message: string;
  raw: string;
}

const ErrorLog: React.FC = () => {
  const { errorLog } = useWPDevToolkit();
  const [logContent, setLogContent] = useState('');
  const [parsedLogs, setParsedLogs] = useState<ParsedLogEntry[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [logSize, setLogSize] = useState(0);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchErrorLog();

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(fetchErrorLog, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  const fetchErrorLog = async () => {
    if (isFetching) return; // Prevent multiple simultaneous requests
    
    setIsFetching(true);
    try {
      const response = await errorLog.get() as ErrorLogResponse;
      
      if (response.log_content) {
        setLogContent(response.log_content);
        const parsed = parseLogContent(response.log_content);
        setParsedLogs(parsed);
        setLogSize(response.file_size || 0);
      } else {
        setLogContent('No errors logged.');
        setParsedLogs([]);
      }
    } catch (error) {
      console.error('Error fetching error log:', error);
      setLogContent('Failed to fetch error log.');
      setParsedLogs([]);
    }
    setIsFetching(false);
  };

  const parseLogContent = (content: string): ParsedLogEntry[] => {
    if (!content) return [];

    // Regex to match log entries: [timestamp] [level] message
    const logEntryRegex = /\[([\d\s\-:.]+)\]\s*\[([A-Z]+)\]\s*(.*?)(?=\n\[\d|\n\s*$|$)/gs;
    const entries: ParsedLogEntry[] = [];
    
    let match;
    while ((match = logEntryRegex.exec(content)) !== null) {
      entries.push({
        timestamp: match[1].trim(),
        level: match[2].trim(),
        message: match[3].trim(),
        raw: match[0],
      });
    }
    
    return entries.reverse(); // Most recent first
  };

  const clearErrorLog = async () => {
    if (!window.confirm('Are you sure you want to clear the error log?')) {
      return;
    }

    setIsClearing(true);
    try {
      await errorLog.clear();
      setLogContent('Error log cleared successfully.');
      setParsedLogs([]);
      setLogSize(0);
    } catch (error) {
      console.error('Error clearing error log:', error);
      setLogContent('Failed to clear error log.');
    }
    setIsClearing(false);
  };

  const getFilteredLogs = () => {
    if (!filterLevel) return parsedLogs;
    return parsedLogs.filter(log => log.level === filterLevel);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLogLevelCount = (level: string): number => {
    return parsedLogs.filter(log => log.level === level).length;
  };

  const getLogLevelClass = (level: string): string => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="wp-dev-toolkit-error-log">
      <h2 className="text-xl font-semibold mb-4">Error Log</h2>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Log Content</h3>
              <p className="text-sm text-gray-500">
                File Size: {formatFileSize(logSize)} | 
                Entries: {parsedLogs.length}
              </p>
            </div>
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
                isDestructive
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
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Filter by level:</span>
            <Button 
              isSmall 
              variant={filterLevel === null ? 'primary' : 'secondary'} 
              onClick={() => setFilterLevel(null)}
            >
              All ({parsedLogs.length})
            </Button>
            <Button 
              isSmall 
              variant={filterLevel === 'ERROR' ? 'primary' : 'secondary'} 
              onClick={() => setFilterLevel('ERROR')}
              className="text-red-700"
            >
              Errors ({getLogLevelCount('ERROR')})
            </Button>
            <Button 
              isSmall 
              variant={filterLevel === 'WARNING' ? 'primary' : 'secondary'} 
              onClick={() => setFilterLevel('WARNING')}
              className="text-yellow-700"
            >
              Warnings ({getLogLevelCount('WARNING')})
            </Button>
            <Button 
              isSmall 
              variant={filterLevel === 'INFO' ? 'primary' : 'secondary'} 
              onClick={() => setFilterLevel('INFO')}
              className="text-blue-700"
            >
              Info ({getLogLevelCount('INFO')})
            </Button>
            
            <div className="ml-auto">
              <ToggleControl
                label="Auto-refresh"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
              />
            </div>
          </div>

          {isFetching ? (
            <div className="flex justify-center items-center p-4">
              <Spinner /> <span className="ml-2">Loading error log...</span>
            </div>
          ) : parsedLogs.length > 0 ? (
            <div className="bg-white border rounded overflow-hidden">
              {getFilteredLogs().map((log, index) => (
                <div key={index} className="border-b last:border-b-0 p-3 hover:bg-gray-50">
                  <div className="flex items-center mb-1">
                    <span className="text-xs text-gray-500 mr-2">{log.timestamp}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getLogLevelClass(log.level)}`}>
                      {log.level}
                    </span>
                  </div>
                  <div className="font-mono text-sm whitespace-pre-wrap">{log.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="text-gray-500">No log entries found.</p>
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
