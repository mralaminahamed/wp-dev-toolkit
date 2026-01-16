import React from 'react';

import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';

import App from '@/App';
import '@/index.css';
import '@/stores';

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

domReady( () => {
	// Verify the global object exists
	if ( ! window.wpDevToolkit ) {
		console.error( 'WP Dev Toolkit: Missing global configuration object. The plugin may not function correctly.' );

		// Create a fallback object with default values for development
		window.wpDevToolkit = {
			apiUrl: '/wp-json/wp-dev-toolkit/v1',
			nonce: '',
			version: '1.0.0',
			debugMode: false,
			pluginUrl: '/',
		};
	}

	// For development testing - if no initial route, set to dashboard
	if ( typeof window.wpDevToolkitInitialRoute === 'undefined' ) {
		window.wpDevToolkitInitialRoute = 'dashboard';
		console.info( 'No initial route found, defaulting to dashboard' );
	}

	// Add version to console for debugging
	console.info( `WP Dev Toolkit v${ window.wpDevToolkit.version } initialized with route: ${ window.wpDevToolkitInitialRoute }` );

	const container = document.getElementById( 'wp-dev-toolkit-app' );
	if ( ! container ) {
		throw new Error( 'Failed to find the root element #wp-dev-toolkit-app' );
	}

	const root = createRoot( container );

	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
} );
