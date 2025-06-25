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
      pluginUrl?: string;
    };
    wpDevToolkitInitialRoute?: string;
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
    debugMode: false,
    pluginUrl: '/'
  };
}

// For development testing - if no initial route, set to dashboard
if (typeof window.wpDevToolkitInitialRoute === 'undefined') {
  window.wpDevToolkitInitialRoute = 'dashboard';
  console.info('No initial route found, defaulting to dashboard');
}

// Add version to console for debugging
console.info(`WP Dev Toolkit v${window.wpDevToolkit.version} initialized with route: ${window.wpDevToolkitInitialRoute}`);

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
        <div className="wp-dev-toolkit-error wdt-p-4 wdt-bg-red-50 wdt-border wdt-border-red-200 wdt-rounded wdt-text-red-700">
          <h2 className="wdt-text-lg wdt-font-semibold wdt-mb-2">Something went wrong</h2>
          <p className="wdt-mb-4">The WordPress Development Toolkit encountered an error and could not load properly.</p>
          {this.state.error && (
            <div className="wdt-mb-4">
              <h3 className="wdt-text-md wdt-font-semibold wdt-mb-1">Error:</h3>
              <pre className="wdt-bg-white wdt-p-2 wdt-rounded wdt-text-sm wdt-overflow-auto">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
          {this.state.errorInfo && (
            <div className="wdt-mb-4">
              <h3 className="wdt-text-md wdt-font-semibold wdt-mb-1">Component Stack:</h3>
              <pre className="wdt-bg-white wdt-p-2 wdt-rounded wdt-text-sm wdt-overflow-auto wdt-max-h-48">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button
            className="wdt-mt-4 wdt-bg-red-600 hover:wdt-bg-red-700 wdt-text-white wdt-py-1 wdt-px-3 wdt-rounded"
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
