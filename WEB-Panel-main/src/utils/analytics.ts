// utils/analytics.ts

import { sendGAEvent } from '@next/third-parties/google';

export type EventParams = Record<string, string | number | boolean | string[] | number[]>;

/**
 * Converts camelCase to snake_case
 * Example: "addToCart" -> "add_to_cart"
 */
const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Converts camelCase to PascalCase
 * Example: "addToCart" -> "AddToCart"
 */
const camelToPascal = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Track custom events across GA and Meta Pixel
 * @param eventName - Event name in camelCase (e.g., "newsletterSignup")
 * @param params - Optional parameters for the event
 */
export const trackEvent = (eventName: string, params?: EventParams) => {
  // Track in Google Analytics (snake_case)
  if (typeof window !== 'undefined' && window.gtag) {
    const snakeCaseEvent = camelToSnake(eventName);
    sendGAEvent('event', snakeCaseEvent, params || {});
  }

  // Track in Meta Pixel (PascalCase as custom event)
  if (typeof window !== 'undefined' && window.fbq) {
    const pascalCaseEvent = camelToPascal(eventName);
    window.fbq('trackCustom', pascalCaseEvent, params);
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
