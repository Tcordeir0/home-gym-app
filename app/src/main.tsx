import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DevBadge from './components/DevBadge';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
    <DevBadge />
  </React.StrictMode>
);

// PWA: registra o service worker (offline + instalável). Atualiza sozinho.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* sem SW, app segue normal */ });
  });
}