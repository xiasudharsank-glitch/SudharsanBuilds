/**
 * Region Suggestion Banner
 *
 * Shows a non-intrusive banner when user might be on the wrong regional domain.
 * Persists dismissal for 7 days to respect user choice.
 * Mobile Responsive: Stacks vertically on small screens.
 */

import { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shouldShowRegionSuggestion, getActiveRegion, getOppositeRegion } from '../config/regions';

const BANNER_DISMISSED_KEY = 'region-banner-dismissed';
const BANNER_DISMISSED_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export default function RegionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [regionData, setRegionData] = useState(null);

  useEffect(() => {
    // 1. Check if configuration says we should show it (Geo-IP match)
    const showBanner = shouldShowRegionSuggestion();
    if (!showBanner) return;

    // 2. Check if user dismissed it recently (LocalStorage)
    const dismissedData = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const now = Date.now();
        // If dismissed less than 7 days ago, do not show
        if (now - timestamp < BANNER_DISMISSED_EXPIRY) {
          return;
        }
      } catch (e) {
        // If local storage data is corrupted, ignore it and show banner
        console.error('Error parsing banner dismissal', e);
      }
    }

    // 3. Safe Data Retrieval
    const current = getActiveRegion();
    if (current) {
      setRegionData(current);
      setIsVisible(true);
    }
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
    if (!regionData) return;

    const oppositeRegion = getOppositeRegion(regionData.region);
    
    // Get current path details so we don't send them to the homepage
    const { protocol, pathname, search } = window.location;
    
    // Construct new URL: Protocol + New Domain + Current Path + Current Search Params
    const newUrl = `${protocol}//${oppositeRegion.domain}${pathname}${search}`;
    
    window.location.href = newUrl;
  };

  // Don't render if logic says hidden or data isn't ready
  if (!isVisible || !regionData) return null;

  // Prepare text content
  const oppositeRegion = getOppositeRegion(regionData.region);
  
  const message =
    regionData.region === 'india'
      ? `You're viewing the India version. Looking for international pricing?`
      : `You're viewing the global version. Looking for India pricing?`;

  const switchText =
    regionData.region === 'india'
      ? `Switch to Global`
      : `Switch to India`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          // Fixed position, ensuring it stays on top of other content
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
        >
          {/* Main Container */}
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            
            {/* LAYOUT FIX:
               1. 'flex-col': Stacks items vertically on mobile (default)
               2. 'sm:flex-row': Switches to horizontal row on tablets/desktops
            */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              
              {/* Message Section */}
              {/* Center text on mobile, Left align on desktop */}
              <div className="flex items-center justify-center sm:justify-start gap-3 w-full sm:w-auto text-center sm:text-left">
                <Globe className="w-5 h-5 flex-shrink-0 opacity-90" />
                <p className="text-sm font-medium leading-snug">
                  {message}
                </p>
              </div>

              {/* Action Buttons Section */}
              {/* Full width on mobile to make buttons easier to tap */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={handleSwitch}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap"
                >
                  {switchText}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors flex-shrink-0 text-white"
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