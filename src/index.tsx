import React from 'react';
import { createRoot } from '@wordpress/element';

import App from '@/App';
import '@/styles/index.scss';
import '@/store';

declare global {
  interface Window {
    wpDevToolkit: {
      apiUrl: string;
      nonce: string;
      version: string;
      logPath?: string;
      debugMode?: boolean;
    };
  }
}

// Verify the global object exists
if (!window.wpDevToolkit) {
  console.error('WP Dev Toolkit: Missing global configuration object. The plugin may not function correctly.');

  // Create a fallback object with default values for development
  window.wpDevToolkit = {
    apiUrl: '/wp-json/wp-dev-toolkit/v1',
    nonce: '',
    version: '1.0.0',
    debugMode: false
  };
}

// Add version to console for debugging
console.info(`WP Dev Toolkit v${window.wpDevToolkit.version} initialized`);

const container = document.getElementById('wp-dev-toolkit-app');
if (!container) {
  throw new Error('Failed to find the root element #wp-dev-toolkit-app');
}

const root = createRoot(container);

// Error boundary component to catch runtime errors
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('WP Dev Toolkit Error:', error, errorInfo);
    
    // Log the error to the server if we're in a WordPress environment
    if (window.wpDevToolkit && window.wpDevToolkit.apiUrl) {
      try {
        fetch(`${window.wpDevToolkit.apiUrl}/error-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.wpDevToolkit.nonce
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            component: errorInfo.componentStack
          })
        }).catch(err => {
          console.error('Failed to log error to server:', err);
        });
      } catch (e) {
        console.error('Failed to send error to API:', e);
      }
    }
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="wp-dev-toolkit-error p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">The WordPress Development Toolkit encountered an error and could not load properly.</p>
          {this.state.error && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-1">Error:</h3>
              <pre className="bg-white p-2 rounded text-sm overflow-auto">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
          {this.state.errorInfo && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-1">Component Stack:</h3>
              <pre className="bg-white p-2 rounded text-sm overflow-auto max-h-48">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
