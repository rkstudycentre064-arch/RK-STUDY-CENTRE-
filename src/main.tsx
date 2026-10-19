import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/serviceWorkerRegistration';

// Register Service Worker for offline document caching and study notes accessibility
try {
  registerServiceWorker();
} catch (e) {
  console.warn('[RK STUDY CENTRE] Service worker registration notice:', e);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error('[RK STUDY CENTRE] Root element #root was not found in document.');
}
