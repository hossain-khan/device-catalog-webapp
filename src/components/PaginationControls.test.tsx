import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaginationControls } from './PaginationControls';
import { PaginationInfo } from '@/lib/paginationUtils';
import * as deviceUtils from '@/lib/deviceUtils';

// Mock scrollToTop
vi.mock('@/lib/deviceUtils', () => ({
  scrollToTop: vi.fn(),
}));

const mockPagination: PaginationInfo = {
  currentPage: 5,
  totalPages: 10,
  totalItems: 100,
  itemsPerPage: 10,
  startIndex: 40,
  endIndex: 50,
  hasPreviousPage: true,
  hasNextPage: true,
};

describe('PaginationControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render if totalItems is 0', () => {
    render(
      <PaginationControls
        pagination={{ ...mockPagination, totalItems: 0 }}
        onPageChange={() => {}}
        onItemsPerPageChange={() => {}}
      />
    );
    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
  });

  it('should call onPageChange when a page button is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        pagination={mockPagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={() => {}}
      />
    );

    const page6Button = screen.getByRole('button', { name: '6' });
    await userEvent.click(page6Button);
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it('should disable previous/first buttons on the first page', () => {
    render(
      <PaginationControls
        pagination={{ ...mockPagination, currentPage: 1, hasPreviousPage: false }}
        onPageChange={() => {}}
        onItemsPerPageChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /go to first page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /go to previous page/i })).toBeDisabled();
  });

  it('should disable next/last buttons on the last page', () => {
    render(
      <PaginationControls
        pagination={{ ...mockPagination, currentPage: 10, totalPages: 10, hasNextPage: false }}
        onPageChange={() => {}}
        onItemsPerPageChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /go to next page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /go to last page/i })).toBeDisabled();
  });

  it('should call scrollToTop on page change by default', async () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        pagination={mockPagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={() => {}}
      />
    );

    const nextPageButton = screen.getByRole('button', { name: /go to next page/i });
    await userEvent.click(nextPageButton);
    expect(deviceUtils.scrollToTop).toHaveBeenCalled();
  });

  it('should NOT call scrollToTop if scrollToTopOnPageChange is false', async () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        pagination={mockPagination}
        onPageChange={onPageChange}
        onItemsPerPageChange={() => {}}
        scrollToTopOnPageChange={false}
      />
    );

    const nextPageButton = screen.getByRole('button', { name: /go to next page/i });
    await userEvent.click(nextPageButton);
    expect(deviceUtils.scrollToTop).not.toHaveBeenCalled();
  });
});
