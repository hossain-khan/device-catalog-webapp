/**
 * Firebase Analytics Utilities
 * 
 * Helper functions for tracking custom events and user interactions
 * with Firebase Analytics.
 */

import { logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { analytics } from './firebase';

/**
 * Log a custom event to Firebase Analytics
 * @param eventName - Name of the event to log
 * @param eventParams - Optional parameters for the event
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (!analytics) {
    // Analytics not initialized - skip tracking
    return;
  }
  
  try {
    logEvent(analytics, eventName, eventParams);
  } catch {
    // Failed to log event - silently continue
  }
};

/**
 * Track page views
 * @param pageName - Name of the page
 * @param pageParams - Optional page parameters
 */
export const trackPageView = (pageName: string, pageParams?: Record<string, unknown>) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
    ...pageParams
  });
};

/**
 * Track device interactions
 * @param action - Action type (e.g., 'view_device', 'search', 'filter')
 * @param params - Additional parameters
 */
export const trackDeviceAction = (action: string, params?: Record<string, unknown>) => {
  trackEvent('device_action', {
    action,
    ...params
  });
};

/**
 * Track search queries
 * @param query - The search query
 * @param resultsCount - Number of results returned
 */
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount
  });
};

/**
 * Track filter usage
 * @param filterType - Type of filter applied
 * @param filterValue - Value of the filter
 */
export const trackFilter = (filterType: string, filterValue: string | number) => {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue
  });
};

/**
 * Set user ID for analytics
 * @param userId - Unique user identifier
 */
export const setAnalyticsUserId = (userId: string) => {
  if (!analytics) return;
  
  try {
    setUserId(analytics, userId);
  } catch {
    // Failed to set user ID - silently continue
  }
};

/**
 * Set custom user properties
 * @param properties - User properties to set
 */
export const setAnalyticsUserProperties = (properties: Record<string, unknown>) => {
  if (!analytics) return;
  
  try {
    setUserProperties(analytics, properties);
  } catch {
    // Failed to set user properties - silently continue
  }
};

// Export analytics instance for direct use if needed
export { analytics };
