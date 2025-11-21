// Suppress Razorpay iframe security warnings (not your code's issue)
const originalError = console.error;
console.error = function(...args) {
  if (args[0]?.includes?.('x-rtb-fingerprint-id')) {
    return;
  }
  originalError.apply(console, args);
};

// Clear old service worker cache on new deployment to fix blank page issue
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);