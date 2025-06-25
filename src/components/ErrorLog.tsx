import React, { useState, useEffect } from 'react';
import { Button, Spinner, ToggleControl, Dashicon } from '@wordpress/components';
import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { ErrorLogResponse } from '@/types/index';

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
      const rawResponse = await errorLog.get();
      // Type assertion with unknown intermediate step
      const response = rawResponse as unknown as ErrorLogResponse;
      
      if (response && response.log_content) {
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

  const getLogLevelIcon = (level: string): string => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'warning';
      case 'WARNING':
        return 'info';
      case 'INFO':
        return 'admin-comments';
      case 'DEBUG':
        return 'code-standards';
      default:
        return 'admin-generic';
    }
  };

  return (
    <div className="wp-dev-toolkit-error-log">
      <div className="wp-dev-toolkit-page-header">
        <h1>Error Log</h1>
        <p>Monitor and manage PHP errors, warnings and notices</p>
      </div>

      <div className="wp-dev-toolkit-card mb-6">
        <div className="wp-dev-toolkit-card-header">
          <div className="flex justify-between items-center">
            <div>
              <h2>Log Summary</h2>
              <div className="text-sm text-gray-500">
                File Size: {formatFileSize(logSize)} | 
                Entries: {parsedLogs.length}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
                onClick={fetchErrorLog}
                disabled={isFetching || isClearing}
                icon="refresh"
              >
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
                onClick={clearErrorLog}
                disabled={isFetching || isClearing}
                icon="trash"
              >
                {isClearing ? 'Clearing...' : 'Clear Log'}
              </Button>
            </div>
          </div>
        </div>
        <div className="wp-dev-toolkit-card-body">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Filter by level:</span>
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterLevel === null ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              onClick={() => setFilterLevel(null)}
            >
              All ({parsedLogs.length})
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterLevel === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              onClick={() => setFilterLevel('ERROR')}
            >
              Errors ({getLogLevelCount('ERROR')})
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterLevel === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              onClick={() => setFilterLevel('WARNING')}
            >
              Warnings ({getLogLevelCount('WARNING')})
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filterLevel === 'INFO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} 
              onClick={() => setFilterLevel('INFO')}
            >
              Info ({getLogLevelCount('INFO')})
            </button>
            
            <div className="ml-auto">
              <ToggleControl
                label="Auto-refresh"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
              />
            </div>
          </div>

          {isFetching ? (
            <div className="flex justify-center items-center p-8">
              <Spinner /> <span className="ml-2">Loading error log...</span>
            </div>
          ) : parsedLogs.length > 0 ? (
            <div className="border rounded-lg overflow-hidden divide-y divide-gray-200">
              {getFilteredLogs().map((log, index) => (
                <div key={index} className="hover:bg-gray-50 transition-colors">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        log.level === 'ERROR' ? 'bg-red-500' :
                        log.level === 'WARNING' ? 'bg-yellow-500' :
                        log.level === 'INFO' ? 'bg-blue-500' : 'bg-gray-500'
                      } text-white`}>
                        <Dashicon icon={getLogLevelIcon(log.level)} size={14} />
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLogLevelClass(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                    </div>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap border border-gray-200">
                      {log.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <Dashicon icon="yes-alt" className="text-green-500 mb-2" size={30} />
              <p className="text-gray-700">No log entries found. Your application is running smoothly!</p>
            </div>
          )}
        </div>
      </div>

      <div className="wp-dev-toolkit-card">
        <div className="wp-dev-toolkit-card-header">
          <h2>Log Settings</h2>
        </div>
        <div className="wp-dev-toolkit-card-body">
          <p className="mb-4">
            The error log captures PHP errors, warnings, and notices based on your WordPress and PHP configurations.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="font-medium mb-1">Log file location:</div>
            <code className="code">{window.wpDevToolkit?.logPath || 'wp-content/wp-dev-toolkit-error.log'}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorLog;
