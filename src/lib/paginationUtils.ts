export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function calculatePagination(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}

export function paginateArray<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): { items: T[]; pagination: PaginationInfo } {
  const pagination = calculatePagination(items.length, currentPage, itemsPerPage);
  const paginatedItems = items.slice(pagination.startIndex, pagination.endIndex);
  
  return {
    items: paginatedItems,
    pagination
  };
}

export const ITEMS_PER_PAGE_OPTIONS = [24, 48, 96, 200, 500, 1000] as const;
export const DEFAULT_ITEMS_PER_PAGE = 48;