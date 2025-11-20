/**
 * Debug utility for development-only logging
 * Automatically removes logs in production builds
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log messages (only in development)
 */
export const debug = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log('✅', message, ...args);
    }
  },

  fail: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.error('❌', message, ...args);
    }
  },

  // Group logs for better organization
  group: (label: string, callback: () => void) => {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },
};
