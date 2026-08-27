import { Link } from 'react-router-dom';
import type { Job } from '../types';

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

export function OpportunityPreviewCard({ job }: { job: Job }) {
  const shortDesc = job.description ? truncate(job.description, 140) : '';
  return (
    <article className="group flex flex-col h-full bg-surface border border-default rounded-[12px] p-5 sm:p-6 hover:border-strong transition-colors focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-subtle border border-default text-strong-secondary">
          {job.domain || 'General'}
        </span>
        {job.compensation && (
          <span className="shrink-0 text-[13px] font-medium text-strong-secondary bg-subtle border border-default rounded-full px-2.5 py-1">
            {job.compensation}
          </span>
        )}
      </div>
      <h3 className="text-[16px] sm:text-[17px] font-semibold leading-snug text-primary line-clamp-2">
        <Link
          to={`/jobs/${job.id}`}
          className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm"
        >
          {job.title}
        </Link>
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[13px] text-secondary">
        {job.locationType && <span>{job.locationType}</span>}
        {job.locationType && job.location && <span aria-hidden="true" className="text-muted">·</span>}
        {job.location && <span className="line-clamp-1">{job.location}</span>}
      </div>
      {shortDesc && <p className="mt-3 text-[14px] leading-[1.6] text-secondary line-clamp-3">{shortDesc}</p>}
      <div className="mt-auto pt-4">
        <Link
          to={`/jobs/${job.id}`}
          className="relative inline-flex items-center gap-1 text-[14px] font-medium text-brand hover:text-[var(--color-action-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm group-hover:gap-1.5 transition-all"
          aria-label={`View opportunity: ${job.title}`}
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

export function OpportunityCardSkeleton() {
  return (
    <div className="bg-surface border border-default rounded-[12px] p-5 sm:p-6 animate-pulse">
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-24 bg-muted rounded-full" />
        <div className="h-6 w-20 bg-muted rounded-full ml-auto" />
      </div>
      <div className="h-5 w-3/4 bg-muted rounded mb-2" />
      <div className="h-5 w-1/2 bg-muted rounded mb-4" />
      <div className="h-4 w-32 bg-subtle rounded mb-3" />
      <div className="h-4 w-full bg-subtle rounded mb-1.5" />
      <div className="h-4 w-5/6 bg-subtle rounded" />
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="bg-surface border border-default rounded-[12px] p-8 sm:p-10 text-center">
      <p className="text-[15px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">
        New opportunities are added as project needs become available. Check back for future openings.
      </p>
      <Link
        to="/jobs"
        className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] text-[14px] font-medium bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px]"
      >
        View all opportunities
      </Link>
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="bg-surface border border-default rounded-[12px] p-8 sm:p-10 text-center">
      <p className="text-[15px] font-medium text-primary">Unable to load opportunities</p>
      <p className="mt-2 text-[14px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">
        {message || 'Something went wrong while retrieving current opportunities. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] text-[14px] font-medium bg-surface text-brand border border-brand hover:bg-brand-subtle transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[44px]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
