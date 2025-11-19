import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile devices
 * @param breakpoint - The breakpoint to use for mobile detection (default: 768px)
 * @returns boolean indicating if the current device is mobile
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

/**
 * Custom hook to detect if device is a touch device
 * @returns boolean indicating if the device supports touch
 */
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - for older browsers
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
};

/**
 * Custom hook to get viewport dimensions
 * @returns object with width and height of viewport
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

/**
 * Custom hook to detect slow network connections
 * @returns boolean indicating if the connection is slow
 */
export const useSlowConnection = (): boolean => {
  const [isSlowConnection, setIsSlowConnection] = useState<boolean>(false);

  useEffect(() => {
    // @ts-ignore - Connection API is not fully supported in TypeScript yet
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      const checkConnection = () => {
        // Consider 2G/slow-2g as slow connections
        setIsSlowConnection(
          connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          connection.saveData === true
        );
      };

      checkConnection();
      connection.addEventListener('change', checkConnection);

      return () => connection.removeEventListener('change', checkConnection);
    }
  }, []);

  return isSlowConnection;
};
