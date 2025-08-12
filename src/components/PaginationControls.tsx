import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight } from "@phosphor-icons/react";
import { PaginationInfo, ITEMS_PER_PAGE_OPTIONS } from "@/lib/paginationUtils";
import { scrollToTop } from "@/lib/deviceUtils";

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  scrollToTopOnPageChange?: boolean;
}

export const PaginationControls = ({
  pagination,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  scrollToTopOnPageChange = true,
}: PaginationControlsProps) => {
  const { currentPage, totalPages, totalItems, itemsPerPage, startIndex, endIndex } = pagination;

  const handlePageChange = (page: number) => {
    onPageChange(page);
    if (scrollToTopOnPageChange) {
      scrollToTop();
    }
  };

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{endIndex} of {totalItems.toLocaleString()} devices
        </div>
        
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
          >
            <CaretDoubleLeft size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
          >
            <CaretLeft size={16} />
          </Button>

          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              page === '...' ? (
                <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className="h-8 min-w-8 px-2 hover:bg-muted hover:text-foreground"
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
          >
            <CaretRight size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
          >
            <CaretDoubleRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};