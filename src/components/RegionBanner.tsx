/**
 * Region Suggestion Banner
 *
 * Shows a non-intrusive banner when user might be on the wrong regional domain
 * Example: India build accessed from .com domain suggests switching to .in
 */

import { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shouldShowRegionSuggestion, getActiveRegion, getOppositeRegion } from '../config/regions';

const BANNER_DISMISSED_KEY = 'region-banner-dismissed';
const BANNER_DISMISSED_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export default function RegionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if banner should be shown
    const showBanner = shouldShowRegionSuggestion();
    setShouldShow(showBanner);

    if (!showBanner) return;

    // Check if user dismissed the banner recently
    const dismissedData = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const now = Date.now();
        if (now - timestamp < BANNER_DISMISSED_EXPIRY) {
          // Still within dismissal period
          return;
        }
      } catch {
        // Invalid data, show banner
      }
    }

    // Show the banner
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal with timestamp
    localStorage.setItem(
      BANNER_DISMISSED_KEY,
      JSON.stringify({ timestamp: Date.now() })
    );
  };

  const handleSwitch = () => {
    const oppositeRegion = getOppositeRegion(getActiveRegion().region);
    const protocol = window.location.protocol;
    const newUrl = `${protocol}//${oppositeRegion.domain}`;
    window.location.href = newUrl;
  };

  if (!shouldShow) return null;

  const currentRegion = getActiveRegion();
  const oppositeRegion = getOppositeRegion(currentRegion.region);

  const message =
    currentRegion.region === 'india'
      ? `You're viewing the India version. Looking for international pricing?`
      : `You're viewing the global version. Looking for India pricing?`;

  const switchText =
    currentRegion.region === 'india'
      ? `Switch to Global (${oppositeRegion.domain})`
      : `Switch to India (${oppositeRegion.domain})`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Icon + Message */}
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm sm:text-base font-medium">{message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleSwitch}
                  className="px-3 sm:px-4 py-1.5 bg-white text-blue-600 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  {switchText}
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors flex-shrink-0"
                  aria-label="Dismiss banner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
