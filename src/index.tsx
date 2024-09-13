import React from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/styles/index.scss';
import '@/store';

const container = document.getElementById('wp-dev-toolkit-app');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
