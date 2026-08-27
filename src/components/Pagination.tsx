type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const visible = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-[13px] text-secondary" aria-live="polite">
        Page <span className="font-medium text-primary">{currentPage}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="min-h-[44px] min-w-[44px] px-4 inline-flex items-center justify-center rounded-[10px] border border-default bg-surface text-[13px] font-medium text-primary hover:bg-subtle hover:border-strong disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
        >
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-1" role="presentation">
          {visible.map((p, idx) =>
            p === '…' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-muted" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-[10px] border text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors ${
                  p === currentPage
                    ? 'bg-[var(--color-action-primary)] text-inverse border-transparent'
                    : 'bg-surface border-default text-primary hover:bg-subtle hover:border-strong'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="min-h-[44px] min-w-[44px] px-4 inline-flex items-center justify-center rounded-[10px] border border-default bg-surface text-[13px] font-medium text-primary hover:bg-subtle hover:border-strong disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
