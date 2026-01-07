'use client';
import { useState, useEffect } from 'react';

// Fallback breakpoints matching Tailwind's defaults
const FALLBACK_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
type Breakpoint = keyof typeof FALLBACK_BREAKPOINTS;

/**
 * Custom hook to get current breakpoint based on window width
 * Prevents hydration mismatch by only activating after client-side mount
 *
 * @returns {Object} - { current, isAbove, isBelow, width }
 */
export function useBreakpoints() {
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [breakpoints, setBreakpoints] = useState(FALLBACK_BREAKPOINTS);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [containerAspectRatio, setContainerAspectRatio] = useState(16 / 9);

  // Only run after hydration to prevent SSR mismatch
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      setAspectRatio(window.innerWidth / window.innerHeight);
      setContainerAspectRatio(Math.min(window.innerWidth, 1696) / window.innerHeight);
    }
  }, []);

  // Read breakpoints from CSS custom properties
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    const getBreakpointsFromCSS = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const cssBreakpoints: Record<string, number> = {};

      // Try to read Tailwind breakpoints from CSS custom properties
      Object.keys(FALLBACK_BREAKPOINTS).forEach((key) => {
        const cssValue = computedStyle.getPropertyValue(`--tw-breakpoint-${key}`);
        if (cssValue) {
          const numValue = parseInt(cssValue.replace('px', ''));
          if (!isNaN(numValue)) {
            cssBreakpoints[key] = numValue;
          }
        }
      });

      if (Object.keys(cssBreakpoints).length > 0) {
        setBreakpoints({ ...FALLBACK_BREAKPOINTS, ...cssBreakpoints });
      }
    };

    getBreakpointsFromCSS();
  }, [isClient]);

  // Update window width on resize
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setAspectRatio(window.innerWidth / window.innerHeight);
      setContainerAspectRatio(Math.min(window.innerWidth, 1696) / window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  // Determine current breakpoint
  const getCurrentBreakpoint = () => {
    if (!isClient) return 'lg'; // Safe default during SSR

    const sortedBreakpoints = Object.entries(breakpoints).sort(([, a], [, b]) => a - b);

    for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
      const [name, width] = sortedBreakpoints[i];
      if (windowWidth >= width) {
        return name;
      }
    }
    return 'xs';
  };

  const breakpoint = getCurrentBreakpoint();

  // Helper functions
  const isAbove = (breakpoint: Breakpoint) => {
    if (!isClient || !breakpoints[breakpoint]) return false;
    return windowWidth >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint) => {
    if (!isClient || !breakpoints[breakpoint]) return false;
    return windowWidth < breakpoints[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint) => {
    if (!isClient) return false;
    const minWidth = breakpoints[min] || 0;
    const maxWidth = breakpoints[max] || Infinity;
    return windowWidth >= minWidth && windowWidth < maxWidth;
  };

  return {
    breakpoint,
    width: windowWidth,
    breakpoints,
    aspectRatio,
    containerAspectRatio,
    isAbove,
    isBelow,
    isBetween,
    isClient, // Expose this so components can conditionally render
    // Convenience getters for common breakpoints
    isMobile: isClient ? windowWidth < breakpoints.md : false,
    isTablet: isClient ? isBetween('md', 'lg') : false,
    isDesktop: isClient ? windowWidth >= breakpoints.lg : false,
  };
}
