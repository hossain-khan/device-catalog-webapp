import { useCallback, useEffect } from 'react';
import { useKV } from './useKV';
import { PaginationState } from '@/types/device';
import { DEFAULT_ITEMS_PER_PAGE, MOBILE_DEFAULT_ITEMS_PER_PAGE } from '@/lib/paginationUtils';

interface UsePaginationOptions {
  isMobile: boolean;
  totalItems: number;
}

/**
 * Custom hook to manage pagination state with mobile-aware defaults
 * Optimizes callback dependencies to prevent unnecessary re-renders
 */
export function usePagination({ isMobile, totalItems }: UsePaginationOptions) {
  // Mobile-aware pagination defaults
  const getDefaultItemsPerPage = useCallback(() => 
    isMobile ? MOBILE_DEFAULT_ITEMS_PER_PAGE : DEFAULT_ITEMS_PER_PAGE, 
    [isMobile]
  );

  const [pagination, setPagination] = useKV<PaginationState>('device-pagination', {
    currentPage: 1,
    itemsPerPage: getDefaultItemsPerPage(),
    totalItems: 0
  });

  // Update total items when it changes, using useEffect to avoid render cycle updates
  useEffect(() => {
    if (totalItems !== pagination.totalItems) {
      setPagination(prevPagination => ({
        ...prevPagination,
        totalItems,
        currentPage: totalItems === 0 ? 1 : Math.min(prevPagination.currentPage, Math.ceil(totalItems / prevPagination.itemsPerPage))
      }));
    }
  }, [totalItems, pagination.totalItems, pagination.currentPage, pagination.itemsPerPage, setPagination]);

  // Optimized page change handler - only depends on setPagination
  const handlePageChange = useCallback((page: number) => {
    setPagination(prevPagination => ({ 
      ...prevPagination, 
      currentPage: page 
    }));
  }, [setPagination]);

  // Optimized items per page change handler - only depends on setPagination
  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    setPagination(prevPagination => ({ 
      ...prevPagination, 
      itemsPerPage, 
      currentPage: 1 
    }));
  }, [setPagination]);

  // Reset pagination to defaults
  const resetPagination = useCallback((newTotalItems: number) => {
    setPagination({
      currentPage: 1,
      itemsPerPage: getDefaultItemsPerPage(),
      totalItems: newTotalItems
    });
  }, [getDefaultItemsPerPage, setPagination]);

  return {
    pagination,
    setPagination,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination
  };
}