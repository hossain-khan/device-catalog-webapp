import { useEffect, useCallback } from 'react';
import { useKV } from './useKV';
import { DeviceFilters, AndroidDevice } from '@/types/device';
import { getRamRange, getSdkVersionRange } from '@/lib/deviceUtils';

interface UseDeviceFiltersOptions {
  devices: AndroidDevice[];
  defaultDevices?: AndroidDevice[];
}

/**
 * Custom hook to manage device filters with automatic range updates
 * Prevents render cycle state updates and provides DRY filter management
 */
export function useDeviceFilters({ devices, defaultDevices = [] }: UseDeviceFiltersOptions) {
  const [filters, setFilters] = useKV<DeviceFilters>('device-filters', {
    search: '',
    formFactor: 'all',
    manufacturer: 'all',
    manufacturers: [], // Initialize empty manufacturers array
    minRam: 'all',
    sdkVersion: 'all'
    // Don't initialize ramRange and sdkVersionRange - they'll be set when valid data is available
  });

  // Migration: Ensure manufacturers array exists for backwards compatibility
  useEffect(() => {
    if (!filters.manufacturers) {
      setFilters(prevFilters => ({
        ...prevFilters,
        manufacturers: []
      }));
    }
  }, [filters.manufacturers, setFilters]);

  // Update ranges when devices change, using useEffect to avoid render cycle updates
  useEffect(() => {
    const shouldUpdateRanges = !filters.ramRange || !filters.sdkVersionRange;
    
    if (devices.length > 0 && shouldUpdateRanges) {
      const ramRange = getRamRange(devices);
      const sdkVersionRange = getSdkVersionRange(devices);
      
      // Only set ranges if they are valid (not Infinity/-Infinity)
      const hasValidRanges = (
        ramRange[0] !== Infinity && ramRange[1] !== -Infinity &&
        sdkVersionRange[0] !== Infinity && sdkVersionRange[1] !== -Infinity
      );
      
      if (hasValidRanges) {
        setFilters(prevFilters => ({
          ...prevFilters,
          ramRange,
          sdkVersionRange,
          manufacturers: prevFilters.manufacturers || [] // Preserve manufacturers array
        }));
      }
    }
  }, [devices, filters.ramRange, filters.sdkVersionRange, setFilters]);

  // Create filter initialization function to eliminate duplication
  const createFilterDefaults = useCallback((targetDevices: AndroidDevice[]) => {
    const ramRange = getRamRange(targetDevices);
    const sdkVersionRange = getSdkVersionRange(targetDevices);
    
    return {
      search: '',
      formFactor: 'all' as const,
      manufacturer: 'all' as const,
      manufacturers: [] as string[],
      minRam: 'all' as const,
      sdkVersion: 'all' as const,
      ramRange,
      sdkVersionRange
    };
  }, []);

  // Reset filters to defaults for uploaded devices
  const resetToUploadedDefaults = useCallback((newDevices: AndroidDevice[]) => {
    const newFilters = createFilterDefaults(newDevices);
    setFilters(newFilters);
  }, [createFilterDefaults, setFilters]);

  // Reset filters to defaults for preloaded devices
  const resetToPreloadedDefaults = useCallback(() => {
    const newFilters = createFilterDefaults(defaultDevices);
    setFilters(newFilters);
  }, [createFilterDefaults, defaultDevices, setFilters]);

  // Optimized filter change handler - memoized to prevent unnecessary re-renders
  const handleFiltersChange = useCallback((newFilters: DeviceFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  return {
    filters,
    setFilters,
    handleFiltersChange,
    resetToUploadedDefaults,
    resetToPreloadedDefaults,
    createFilterDefaults
  };
}