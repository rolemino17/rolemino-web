import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { JobCard } from './JobCard';

export function OpportunityPreviewCard({ job }: { job: Job }) {
  return <JobCard job={job} />;
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
