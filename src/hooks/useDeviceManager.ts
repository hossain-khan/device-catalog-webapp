import { useMemo } from 'react';
import { useKV } from './useKV';
import { useDebounce } from './useDebounce';
import { useDeviceFilters } from './useDeviceFilters';
import { usePagination } from './usePagination';
import { AndroidDevice } from '@/types/device';
import { 
  filterDevices, 
  calculateDeviceStats, 
  getUniqueManufacturers, 
  getUniqueFormFactors, 
  getUniqueSdkVersions,
  getRamRange,
  getSdkVersionRange
} from '@/lib/deviceUtils';
import { paginateArray } from '@/lib/paginationUtils';

interface UseDeviceManagerOptions {
  preloadedData: AndroidDevice[] | null;
  isMobile: boolean;
}

/**
 * Master hook that manages all device-related state and operations
 * Consolidates device management, filtering, and pagination logic
 */
export function useDeviceManager({ preloadedData, isMobile }: UseDeviceManagerOptions) {
  // Use uploaded devices if available, otherwise use preloaded data
  const [uploadedDevices, setUploadedDevices] = useKV<AndroidDevice[]>('uploaded-devices', []);

  // Memoized devices selection
  const devices = useMemo(() => (
    uploadedDevices.length > 0 ? uploadedDevices : (preloadedData || [])
  ), [uploadedDevices, preloadedData]);

  // Device filters management
  const {
    filters,
    handleFiltersChange,
    resetToUploadedDefaults,
    resetToPreloadedDefaults
  } = useDeviceFilters({ 
    devices, 
    defaultDevices: preloadedData || [] 
  });

  // Debounce search to improve performance
  const debouncedFilters = useDebounce(filters, 300);

  // Filter devices with debounced search
  const filteredDevices = useMemo(() => 
    filterDevices(devices, debouncedFilters), 
    [devices, debouncedFilters]
  );

  // Pagination management
  const {
    pagination,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination
  } = usePagination({ 
    isMobile, 
    totalItems: filteredDevices.length 
  });

  // Paginate filtered devices
  const { items: paginatedDevices, pagination: paginationInfo } = useMemo(() => 
    paginateArray(filteredDevices, pagination.currentPage, pagination.itemsPerPage),
    [filteredDevices, pagination.currentPage, pagination.itemsPerPage]
  );

  // Memoized calculations
  const calculations = useMemo(() => ({
    allStats: calculateDeviceStats(devices),
    uniqueManufacturers: getUniqueManufacturers(devices),
    uniqueFormFactors: getUniqueFormFactors(devices),
    uniqueSdkVersions: getUniqueSdkVersions(devices),
    ramRange: getRamRange(devices),
    sdkVersionRange: getSdkVersionRange(devices)
  }), [devices]);

  // Filtering state
  const isFiltering = useMemo(() => 
    filters !== debouncedFilters, 
    [filters, debouncedFilters]
  );

  return {
    // Device data
    devices,
    uploadedDevices,
    setUploadedDevices,
    filteredDevices,
    paginatedDevices,
    
    // Filters
    filters,
    debouncedFilters,
    handleFiltersChange,
    resetToUploadedDefaults,
    resetToPreloadedDefaults,
    isFiltering,
    
    // Pagination
    pagination,
    paginationInfo,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
    
    // Calculations
    ...calculations
  };
}