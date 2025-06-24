import React from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/styles/index.scss';
import '@/store';

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
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

// Error boundary component to catch runtime errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WP Dev Toolkit Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="wp-dev-toolkit-error p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">The WordPress Development Toolkit encountered an error and could not load properly.</p>
          {this.state.error && (
            <pre className="bg-white p-2 rounded text-sm overflow-auto">
              {this.state.error.toString()}
            </pre>
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
