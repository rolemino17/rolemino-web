import { Link, useLocation } from 'react-router-dom';
import type { Job } from '../types';

function truncate(text: string, max: number) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

function clean(v: string | undefined | null) {
  return v?.trim() ?? '';
}

export function JobCard({ job }: { job: Job }) {
  const location = useLocation();
  const domain = clean(job.domain);
  const country = clean(job.location);
  const workType = clean(job.locationType);
  const compensation = clean(job.compensation);
  const description = clean(job.description);
  const shortDesc = description ? truncate(description, 160) : '';

  // Preserve discovery query for back navigation
  const fromSearch = location.search;

  return (
    <article className="flex flex-col h-full bg-surface border border-default rounded-[12px] p-5 sm:p-6 hover:border-strong transition-colors">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {domain && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] text-[11px] font-medium tracking-wide bg-subtle border border-default text-strong-secondary">
            {domain}
          </span>
        )}
        {workType && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-subtle border border-default text-strong-secondary">
            {workType}
          </span>
        )}
        {compensation && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-subtle border border-default text-strong-secondary">
            {compensation}
          </span>
        )}
      </div>

      <h3 className="text-[16px] sm:text-[17px] font-semibold leading-snug text-primary">
        <Link
          to={`/jobs/${job.id}`}
          state={{ fromSearch }}
          className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm"
        >
          {job.title}
        </Link>
      </h3>

      {(country || workType) && (
        <p className="mt-1.5 text-[13px] leading-[1.5] text-secondary flex flex-wrap items-center gap-1.5">
          {country && <span>{country}</span>}
          {country && workType && <span aria-hidden="true" className="text-muted"></span>}
          
        </p>
      )}

      {shortDesc && <p className="mt-3 text-[14px] leading-[1.6] text-secondary line-clamp-3">{shortDesc}</p>}

      <div className="mt-4">
        <Link
          to={`/jobs/${job.id}`}
          state={{ fromSearch }}
          aria-label={`View opportunity: ${job.title}`}
          className="inline-flex items-center gap-1 text-[14px] font-medium text-brand hover:text-[var(--color-action-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm transition-colors"
        >
          View opportunity
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

// Keep preview export compatibility
export { JobCard as OpportunityCard };
export { JobCard as default };
