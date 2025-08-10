import { describe, it, expect } from 'vitest';
import {
  calculatePagination,
  paginateArray,
  ITEMS_PER_PAGE_OPTIONS,
  DEFAULT_ITEMS_PER_PAGE
} from '@/lib/paginationUtils';

describe('paginationUtils', () => {
  describe('calculatePagination', () => {
    it('should calculate pagination info for first page', () => {
      const result = calculatePagination(100, 1, 10);
      
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 10,
        totalItems: 100,
        itemsPerPage: 10,
        startIndex: 0,
        endIndex: 10,
        hasNextPage: true,
        hasPreviousPage: false
      });
    });

    it('should calculate pagination info for middle page', () => {
      const result = calculatePagination(100, 5, 10);
      
      expect(result).toEqual({
        currentPage: 5,
        totalPages: 10,
        totalItems: 100,
        itemsPerPage: 10,
        startIndex: 40,
        endIndex: 50,
        hasNextPage: true,
        hasPreviousPage: true
      });
    });

    it('should calculate pagination info for last page', () => {
      const result = calculatePagination(100, 10, 10);
      
      expect(result).toEqual({
        currentPage: 10,
        totalPages: 10,
        totalItems: 100,
        itemsPerPage: 10,
        startIndex: 90,
        endIndex: 100,
        hasNextPage: false,
        hasPreviousPage: true
      });
    });

    it('should handle last page with fewer items', () => {
      const result = calculatePagination(95, 10, 10);
      
      expect(result).toEqual({
        currentPage: 10,
        totalPages: 10,
        totalItems: 95,
        itemsPerPage: 10,
        startIndex: 90,
        endIndex: 95,
        hasNextPage: false,
        hasPreviousPage: true
      });
    });

    it('should handle single page', () => {
      const result = calculatePagination(5, 1, 10);
      
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 5,
        itemsPerPage: 10,
        startIndex: 0,
        endIndex: 5,
        hasNextPage: false,
        hasPreviousPage: false
      });
    });

    it('should handle empty dataset', () => {
      const result = calculatePagination(0, 1, 10);
      
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        startIndex: 0,
        endIndex: 0,
        hasNextPage: false,
        hasPreviousPage: false
      });
    });

    it('should handle edge case where items per page equals total items', () => {
      const result = calculatePagination(10, 1, 10);
      
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 10,
        itemsPerPage: 10,
        startIndex: 0,
        endIndex: 10,
        hasNextPage: false,
        hasPreviousPage: false
      });
    });

    it('should handle large datasets with small page sizes', () => {
      const result = calculatePagination(22751, 500, 24); // Similar to the app's device catalog
      
      expect(result.totalPages).toBe(948); // Math.ceil(22751 / 24)
      expect(result.startIndex).toBe(11976); // (500 - 1) * 24
      expect(result.endIndex).toBe(12000); // startIndex + 24
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });
  });

  describe('paginateArray', () => {
    const testData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    it('should paginate array correctly for first page', () => {
      const result = paginateArray(testData, 1, 10);
      
      expect(result.items).toHaveLength(10);
      expect(result.items[0]).toEqual({ id: 1, name: 'Item 1' });
      expect(result.items[9]).toEqual({ id: 10, name: 'Item 10' });
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should paginate array correctly for second page', () => {
      const result = paginateArray(testData, 2, 10);
      
      expect(result.items).toHaveLength(10);
      expect(result.items[0]).toEqual({ id: 11, name: 'Item 11' });
      expect(result.items[9]).toEqual({ id: 20, name: 'Item 20' });
      expect(result.pagination.currentPage).toBe(2);
    });

    it('should handle last page with fewer items', () => {
      const result = paginateArray(testData, 3, 10);
      
      expect(result.items).toHaveLength(5); // Only 5 items on last page
      expect(result.items[0]).toEqual({ id: 21, name: 'Item 21' });
      expect(result.items[4]).toEqual({ id: 25, name: 'Item 25' });
      expect(result.pagination.currentPage).toBe(3);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should handle empty array', () => {
      const result = paginateArray([], 1, 10);
      
      expect(result.items).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle page beyond available pages', () => {
      const result = paginateArray(testData, 10, 10); // Page 10 doesn't exist
      
      expect(result.items).toEqual([]); // Should return empty array
      expect(result.pagination.currentPage).toBe(10);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should handle single item per page', () => {
      const result = paginateArray(testData.slice(0, 3), 2, 1);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({ id: 2, name: 'Item 2' });
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should handle large page size', () => {
      const result = paginateArray(testData, 1, 100); // Page size larger than data
      
      expect(result.items).toHaveLength(25);
      expect(result.items).toEqual(testData);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should work with real-world device catalog scenario', () => {
      const mockDevices = Array.from({ length: 22751 }, (_, i) => ({ 
        id: i + 1, 
        name: `Device ${i + 1}` 
      }));
      
      const result = paginateArray(mockDevices, 1, DEFAULT_ITEMS_PER_PAGE);
      
      expect(result.items).toHaveLength(DEFAULT_ITEMS_PER_PAGE);
      expect(result.pagination.totalPages).toBe(Math.ceil(22751 / DEFAULT_ITEMS_PER_PAGE));
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });
  });

  describe('constants', () => {
    it('should have valid items per page options', () => {
      expect(ITEMS_PER_PAGE_OPTIONS).toEqual([24, 48, 96, 200, 500, 1000]);
      expect(ITEMS_PER_PAGE_OPTIONS).toHaveLength(6);
      expect(ITEMS_PER_PAGE_OPTIONS.every(option => typeof option === 'number' && option > 0)).toBe(true);
    });

    it('should have valid default items per page', () => {
      expect(DEFAULT_ITEMS_PER_PAGE).toBe(24);
      expect(ITEMS_PER_PAGE_OPTIONS).toContain(DEFAULT_ITEMS_PER_PAGE);
    });
  });
});