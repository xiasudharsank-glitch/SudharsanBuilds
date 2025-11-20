/**
 * Environment variable validation and access utilities
 * Provides runtime checks for missing environment variables in production
 */

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  RAZORPAY_KEY_ID: string;
  FORMSPREE_ID: string;
  EMAILJS_SERVICE_ID: string;
  EMAILJS_PUBLIC_KEY: string;
  EMAILJS_TEMPLATE_BOOKING: string;
  EMAILJS_TEMPLATE_INVOICE: string;
  YOUR_EMAIL: string;
  WHATSAPP_NUMBER: string;
  UPI_ID: string;
}

/**
 * Get environment variable with validation
 * @param key - The environment variable key (without VITE_ prefix)
 * @param required - Whether the variable is required
 * @returns The environment variable value or undefined
 */
function getEnvVar(key: string, required: boolean = true): string | undefined {
  const value = import.meta.env[`VITE_${key}`];

  // Check if value is missing or is a placeholder (including common placeholder patterns)
  const isMissing = !value ||
                    value === '' ||
                    value.includes('YOUR_') ||
                    value.includes('_HERE') ||
                    value.includes('your-project') ||
                    value.includes('your_') ||
                    value.includes('xxxxx');

  if (required && isMissing) {
    const errorMsg = `❌ Missing required environment variable: VITE_${key}`;
    console.error(errorMsg);

    if (import.meta.env.PROD) {
      // In production, show user-friendly error
      console.error(`
🚨 Configuration Error Detected

The application is missing required configuration for: ${key}

This usually means:
1. Environment variables weren't set in Vercel/hosting dashboard
2. The deployment needs to be rebuilt after setting variables
3. Variables were set but the build cache needs clearing

Please contact the site administrator.
      `);
    }

    return undefined;
  }

  if (isMissing) {
    console.warn(`⚠️ Optional environment variable missing: VITE_${key}`);
    return undefined;
  }

  return value;
}

/**
 * Validate all required environment variables on app startup
 * @returns Object with validation results
 */
export function validateEnv(): { isValid: boolean; missing: string[] } {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'RAZORPAY_KEY_ID',
    'FORMSPREE_ID',
    'EMAILJS_SERVICE_ID',
    'EMAILJS_PUBLIC_KEY',
    'EMAILJS_TEMPLATE_BOOKING',
    'YOUR_EMAIL',
    'WHATSAPP_NUMBER'
  ];

  const missing: string[] = [];

  requiredVars.forEach(key => {
    const value = getEnvVar(key, false);
    if (!value) {
      missing.push(`VITE_${key}`);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    return { isValid: false, missing };
  }

  console.log('✅ All required environment variables are configured');
  return { isValid: true, missing: [] };
}

/**
 * Get all environment variables with validation
 */
export const env: EnvConfig = {
  SUPABASE_URL: getEnvVar('SUPABASE_URL') || '',
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY') || '',
  RAZORPAY_KEY_ID: getEnvVar('RAZORPAY_KEY_ID') || '',
  FORMSPREE_ID: getEnvVar('FORMSPREE_ID') || '',
  EMAILJS_SERVICE_ID: getEnvVar('EMAILJS_SERVICE_ID') || '',
  EMAILJS_PUBLIC_KEY: getEnvVar('EMAILJS_PUBLIC_KEY') || '',
  EMAILJS_TEMPLATE_BOOKING: getEnvVar('EMAILJS_TEMPLATE_BOOKING') || '',
  EMAILJS_TEMPLATE_INVOICE: getEnvVar('EMAILJS_TEMPLATE_INVOICE', false) || 'template_invoice',
  YOUR_EMAIL: getEnvVar('YOUR_EMAIL') || '',
  WHATSAPP_NUMBER: getEnvVar('WHATSAPP_NUMBER') || '',
  UPI_ID: getEnvVar('UPI_ID', false) || ''
};

/**
 * Check if a specific feature is available based on env vars
 */
export const features = {
  hasPayment: !!env.RAZORPAY_KEY_ID && !!env.SUPABASE_URL,
  hasAIChat: !!env.SUPABASE_URL && !!env.SUPABASE_ANON_KEY,
  hasEmailJS: !!env.EMAILJS_SERVICE_ID && !!env.EMAILJS_PUBLIC_KEY,
  hasContactForm: !!env.FORMSPREE_ID
};

// Log feature availability in development
if (import.meta.env.DEV) {
  console.log('🔧 Feature availability:', features);
}
