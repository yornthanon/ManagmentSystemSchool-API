import {ChevronLeft, ChevronRight} from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (nextPage: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
}: PaginationProps) {
  if (totalElements === 0) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500">
      <div className="tabular-nums">
        Showing <span className="font-medium text-slate-800">{start}</span> to{' '}
        <span className="font-medium text-slate-800">{end}</span> of{' '}
        <span className="font-medium text-slate-800">{totalElements}</span> entries
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>
        <span className="px-2 tabular-nums text-slate-600">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
