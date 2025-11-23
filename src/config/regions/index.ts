/**
 * Region Configuration Manager
 *
 * Centralized region management for India vs Global configurations
 */

import { RegionConfig, RegionType } from './types';
import { indiaConfig } from './india.config';
import { globalConfig } from './global.config';

// ============================================================================
// Region Selection
// ============================================================================

/**
 * Get the active region configuration based on environment variable
 * Falls back to domain detection if VITE_REGION is not set
 */
export function getActiveRegion(): RegionConfig {
  // Check environment variable first (build-time config)
  const envRegion = import.meta.env.VITE_REGION as RegionType | undefined;

  if (envRegion === 'india') {
    return indiaConfig;
  } else if (envRegion === 'global') {
    return globalConfig;
  }

  // Fallback: Detect from domain (runtime)
  const detectedRegion = detectRegionFromDomain();
  return detectedRegion === 'india' ? indiaConfig : globalConfig;
}

/**
 * Detect region based on current domain
 * Used for runtime detection and region suggestions
 */
export function detectRegionFromDomain(): RegionType {
  if (typeof window === 'undefined') return 'global';

  const hostname = window.location.hostname;

  // Check if domain contains .in (India)
  if (hostname.includes('.in')) {
    return 'india';
  }

  // Default to global for .com or any other domain
  return 'global';
}

/**
 * Check if user is on the wrong domain for their build
 * Returns true if suggestion banner should be shown
 */
export function shouldShowRegionSuggestion(): boolean {
  const buildRegion = import.meta.env.VITE_REGION as RegionType | undefined;
  if (!buildRegion) return false; // No suggestion if region not set

  const domainRegion = detectRegionFromDomain();
  return buildRegion !== domainRegion;
}

/**
 * Get the opposite region config (for switcher)
 */
export function getOppositeRegion(currentRegion: RegionType): RegionConfig {
  return currentRegion === 'india' ? globalConfig : indiaConfig;
}

// ============================================================================
// Currency Helpers
// ============================================================================

/**
 * Format a number as currency based on active region
 */
export function formatCurrency(amount: number, config?: RegionConfig): string {
  const regionConfig = config || getActiveRegion();
  const { symbol, code, locale } = regionConfig.currency;

  // Format using Intl.NumberFormat
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}

/**
 * Format a price range (e.g., "$10-$20/hour")
 */
export function formatPriceRange(min: number, max: number, config?: RegionConfig): string {
  const regionConfig = config || getActiveRegion();
  const minFormatted = formatCurrency(min, regionConfig);
  const maxFormatted = formatCurrency(max, regionConfig);
  return `${minFormatted}-${maxFormatted}`;
}

// ============================================================================
// Exports
// ============================================================================

export { indiaConfig, globalConfig };
export type { RegionConfig, RegionType };

// Default export: active region config
export default getActiveRegion();
