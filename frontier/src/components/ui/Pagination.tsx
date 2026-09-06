import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number; // How many numbers to show around current page
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  siblingCount = 1,
}) => {
  
  // Helper to generate the pagination range
  const generatePagination = () => {
    // If total pages is small, show all
    if (totalPages <= 5 + siblingCount * 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 1: Show right dots only
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    // Case 2: Show left dots only
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [firstPageIndex, '...', ...rightRange];
    }

    // Case 3: Show both dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    
    return [];
  };

  const pages = generatePagination();

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <nav className={`flex items-center gap-1 ${className}`} aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="
          p-2 rounded-lg transition-colors flex items-center justify-center
          text-grey-500 hover:text-grey-900 dark:text-grey-400 dark:hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-grey-500
        "
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-grey-400 dark:text-grey-600">
                <MoreHorizontal size={14} />
              </span>
            );
          }

          const isCurrent = page === currentPage;
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`
                min-w-[32px] h-8 px-1 rounded-lg text-sm font-medium transition-all duration-200
                flex items-center justify-center
                ${isCurrent 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-grey-600 dark:text-grey-400 hover:bg-grey-100 dark:hover:bg-grey-800'
                }
              `}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="
          p-2 rounded-lg transition-colors flex items-center justify-center
          text-grey-500 hover:text-grey-900 dark:text-grey-400 dark:hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-grey-500
        "
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;