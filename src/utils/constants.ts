/**
 * Application-wide constants for timing, pricing, and configuration
 * Extracted to prevent magic numbers and improve maintainability
 */

// ✅ LOW PRIORITY FIX: Extract timing constants
export const TIMING = {
  // Navigation delays (ms)
  NAVIGATION_DELAY: 800,
  LAZY_LOAD_DELAY: 100,

  // Modal and animation delays
  MODAL_FOCUS_DELAY: 100,

  // Status message auto-clear durations
  STATUS_SUCCESS_DURATION: 7000,
  STATUS_ERROR_DURATION: 5000,

  // Scroll throttling
  SCROLL_THROTTLE: 100,
  MOUSE_THROTTLE: 16, // ~60fps

  // Speech recognition
  SPEECH_NO_MATCH_DELAY: 2000,
  SPEECH_SILENCE_TIMEOUT: 3000,

  // Debounce/throttle
  DEBOUNCE_DEFAULT: 300,
  THROTTLE_DEFAULT: 100,
} as const;

// ✅ LOW PRIORITY FIX: Extract pricing constants
export const PRICING = {
  LANDING_PAGE: {
    total: 15000,
    deposit: 5000,
    timeline: '1-2 weeks',
  },
  PORTFOLIO: {
    total: 20000,
    deposit: 7000,
    timeline: '2-3 weeks',
  },
  BUSINESS: {
    total: 30000,
    deposit: 10000,
    timeline: '3-4 weeks',
  },
  PERSONAL_BRAND: {
    total: 25000,
    deposit: 8000,
    timeline: '3 weeks',
  },
  ECOMMERCE: {
    total: 50000,
    deposit: 15000,
    timeline: '4-6 weeks',
  },
  SAAS: {
    total: 75000,
    deposit: 25000,
    timeline: '6-10 weeks',
  },
  WEB_APP: {
    total: 60000,
    deposit: 20000,
    timeline: '5-8 weeks',
  },
  HOURLY_RATE: {
    min: 500,
    max: 1000,
    unit: 'hour',
  },
} as const;

// ✅ LOW PRIORITY FIX: Extract configuration constants
export const CONFIG = {
  // Chat configuration
  CHAT: {
    MESSAGE_HISTORY_LIMIT: 20,
    MESSAGE_DAILY_LIMIT: 25,
    STREAMING_SPEED: 15, // ms per character
    MAX_OUTPUT_TOKENS: 400,
  },

  // Local storage keys
  STORAGE_KEYS: {
    THEME: 'ai-chat-theme',
    CHAT_HISTORY: 'ai-chat-history',
    USER_ID: 'ai-chat-user-id',
    MESSAGE_COUNT: 'ai-chat-message-count',
    MESSAGE_COUNT_DATE: 'ai-chat-message-count-date',
  },

  // Grid and layout
  GRID: {
    PROJECTS_PER_PAGE: 6,
    TESTIMONIALS_PER_PAGE: 3,
    BLOG_POSTS_PER_PAGE: 6,
  },

  // Animation thresholds
  ANIMATION: {
    MOUSE_MOVE_THRESHOLD: 0.1,
    SCROLL_THRESHOLD: 10,
  },
} as const;

// ✅ LOW PRIORITY FIX: Export type for TypeScript support
export type Timing = typeof TIMING;
export type Pricing = typeof PRICING;
export type Config = typeof CONFIG;
