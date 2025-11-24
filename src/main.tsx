// ✅ P1 FIX: Suppress only specific Razorpay iframe security warnings
// More targeted filtering to avoid hiding legitimate errors
const originalError = console.error;
console.error = function(...args) {
  const firstArg = args[0];

  // Only suppress Razorpay's specific iframe fingerprint warnings
  // These are harmless third-party warnings from Razorpay's payment gateway SDK
  if (
    typeof firstArg === 'string' &&
    firstArg.includes('x-rtb-fingerprint-id') &&
    (firstArg.includes('iframe') || firstArg.toLowerCase().includes('razorpay'))
  ) {
    return; // Suppress only this specific Razorpay warning
  }

  // Log all other errors normally (including other Razorpay errors)
  originalError.apply(console, args);
};

// ✅ P1 FIX: Only unregister service workers on version change or if explicitly needed
// Unregistering on every page load breaks PWA functionality and wastes bandwidth
// This should only run when deploying a new version or removing PWA functionality
//
// TODO: Remove this code block entirely if PWA is not being used
// TODO: If PWA is needed, implement proper version-based SW updates instead
//
// Temporarily disabled to prevent breaking offline functionality:
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.getRegistrations().then(registrations => {
//     registrations.forEach(registration => {
//       registration.unregister();
//     });
//   });
// }

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { validateEnv } from './utils/env';

// ✅ P3 FIX: Validate environment variables at startup
validateEnv();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);