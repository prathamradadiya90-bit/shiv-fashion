import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  itemName = 'items',
}) => {
  if (totalPages <= 1 && totalCount <= pageSize) return null;

  const startCount = Math.min((page - 1) * pageSize + 1, totalCount);
  const endCount = Math.min(page * pageSize, totalCount);

  return (
    <div className="px-6 py-4 bg-neutral-50/70 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
      <div>
        Showing <span className="font-bold text-neutral-900">{startCount}</span> to{' '}
        <span className="font-bold text-neutral-900">{endCount}</span> of{' '}
        <span className="font-bold text-neutral-900">{totalCount}</span> {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          title="Previous Page"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="px-3 py-1 font-semibold text-neutral-800 bg-white border border-neutral-200 rounded-xl shadow-xs">
          Page {page} of {totalPages}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          title="Next Page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
