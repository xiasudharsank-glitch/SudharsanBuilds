/**
 * Country Switcher Component
 *
 * Allows users to manually switch between India and Global versions
 * Shows current region with flag emoji
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveRegion, indiaConfig, globalConfig } from '../config/regions';

interface Region {
  name: string;
  flag: string;
  domain: string;
  code: 'india' | 'global';
}

const regions: Region[] = [
  {
    name: 'India',
    flag: '🇮🇳',
    domain: indiaConfig.domain,
    code: 'india',
  },
  {
    name: 'Global',
    flag: '🌍',
    domain: globalConfig.domain,
    code: 'global',
  },
];

export default function CountrySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentRegion = getActiveRegion();
  const activeRegion = regions.find((r) => r.code === currentRegion.region) || regions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (region: Region) => {
    if (region.code === currentRegion.region) {
      setIsOpen(false);
      return;
    }

    // Redirect to the selected region's domain
    const protocol = window.location.protocol;
    const path = window.location.pathname;
    const newUrl = `${protocol}//${region.domain}${path}`;
    window.location.href = newUrl;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - ✅ ENHANCED: Show pricing info for clarity */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors border border-white/20 dark:border-gray-700"
        aria-label="Switch region"
        aria-expanded={isOpen}
      >
        <span className="text-xl">{activeRegion.flag}</span>
        <span className="text-sm font-medium">
          {activeRegion.name} - Pricing in {currentRegion.currency.symbol}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="py-2">
              {regions.map((region) => {
                const isActive = region.code === currentRegion.region;

                return (
                  <button
                    key={region.code}
                    onClick={() => handleSwitch(region)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className="text-2xl">{region.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {region.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {region.domain}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Switching regions will change pricing, payment methods, and content to match
                  your selected market.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
