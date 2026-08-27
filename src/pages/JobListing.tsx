import { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobs } from '../api/api';
import type { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { OpportunityFilters, ActiveFilterChips } from '../components/OpportunityFilters';
import { Pagination } from '../components/Pagination';
import {
  filterActive,
  getUniqueOptions,
  filterJobsClient,
  paginate,
  hasActiveFilters,
  type OpportunityFilters as FilterType,
} from '../utils/opportunities';

const PER_PAGE = 10;

export function JobListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: jobs, isLoading, isError, refetch } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

  const activeJobs = useMemo(() => (jobs ? filterActive(jobs) : []), [jobs]);

  const domains = useMemo(() => getUniqueOptions(activeJobs, 'domain'), [activeJobs]);
  const locations = useMemo(() => getUniqueOptions(activeJobs, 'location'), [activeJobs]);
  const workTypes = useMemo(() => getUniqueOptions(activeJobs, 'locationType'), [activeJobs]);

  // Parse URL
  const filters: FilterType = useMemo(() => {
    const rawQ = searchParams.get('q') ?? '';
    const rawDomain = searchParams.get('domain') ?? '';
    const rawLocation = searchParams.get('location') ?? '';
    const rawWorkType = searchParams.get('workType') ?? '';
    const rawPage = searchParams.get('page') ?? '';
    const domain = domains.includes(rawDomain) ? rawDomain : '';
    const location = locations.includes(rawLocation) ? rawLocation : '';
    const workType = workTypes.includes(rawWorkType) ? rawWorkType : '';
    let page = parseInt(rawPage, 10);
    if (!Number.isFinite(page) || page < 1) page = 1;
    return { q: rawQ, domain, location, workType, page };
  }, [searchParams, domains, locations, workTypes]);

  // Apply client-side search + filters
  const filtered = useMemo(
    () => filterJobsClient(activeJobs, { q: filters.q, domain: filters.domain, location: filters.location, workType: filters.workType }),
    [activeJobs, filters.q, filters.domain, filters.location, filters.workType],
  );

  const { pageItems, totalPages, currentPage } = useMemo(
    () => paginate(filtered, filters.page, PER_PAGE),
    [filtered, filters.page],
  );

  // Normalize page if out of bounds -> update URL
  useEffect(() => {
    if (filtered.length === 0) return;
    if (currentPage !== filters.page) {
      const next = new URLSearchParams(searchParams);
      if (currentPage === 1) next.delete('page');
      else next.set('page', String(currentPage));
      setSearchParams(next, { replace: true });
    }
  }, [currentPage, filters.page, filtered.length, searchParams, setSearchParams]);

  // SEO metadata
  useEffect(() => {
    document.title = 'Opportunities | Rolemino';
    const desc = 'Explore professional project opportunities in language, data, research and digital evaluation through Rolemino.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);

  // Store current search for detail back navigation
  useEffect(() => {
    sessionStorage.setItem('jobs-search', searchParams.toString());
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) next.set(key, key === 'q' ? value : trimmed);
    else next.delete(key);
    // reset pagination
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) next.delete('page');
    else next.set('page', String(page));
    setSearchParams(next);
    // focus/scroll to results
    requestAnimationFrame(() => {
      resultsRef.current?.focus();
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleRemoveChip = (key: 'q' | 'domain' | 'location' | 'workType') => {
    const next = new URLSearchParams(searchParams);
    next.delete(key === 'workType' ? 'workType' : key);
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const hasActive = hasActiveFilters(filters);
  const noActiveOpportunities = !isLoading && !isError && activeJobs.length === 0;
  const noSearchResults = !isLoading && !isError && activeJobs.length > 0 && filtered.length === 0;

  // Result summary
  const resultSummary = (() => {
    if (isLoading || isError) return null;
    if (noActiveOpportunities || noSearchResults) return null;
    const total = filtered.length;
    const noun = total === 1 ? 'opportunity' : 'opportunities';
    if (filters.q.trim()) {
      return `${total} ${noun} matching “${filters.q.trim()}”`;
    }
    return `${total} ${noun}`;
  })();

  return (
    <div className="pt-16 bg-canvas min-h-screen">
      <main id="main-content" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-[13px] text-secondary">
            <li>
              <Link to="/" className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li aria-current="page" className="font-medium text-primary">
              Opportunities
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="max-w-[720px] mb-8">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-px w-6 bg-decorative shrink-0" />
            Current opportunities
          </p>
          <h1 className="mt-3 text-[30px] sm:text-[36px] font-bold tracking-tight leading-[1.1] text-primary">Find work suited to your experience.</h1>
          <p className="mt-3 text-[15px] leading-[1.65] text-secondary max-w-[62ch]">
            Explore active projects across professional disciplines. Requirements, location eligibility and compensation vary by opportunity.
          </p>
        </div>

        {/* Search + Filters */}
        <OpportunityFilters
          q={filters.q}
          onQChange={(v) => updateParam('q', v)}
          domain={filters.domain}
          onDomainChange={(v) => updateParam('domain', v)}
          location={filters.location}
          onLocationChange={(v) => updateParam('location', v)}
          workType={filters.workType}
          onWorkTypeChange={(v) => updateParam('workType', v)}
          domains={domains}
          locations={locations}
          workTypes={workTypes}
          onClearAll={handleClearAll}
          hasActive={hasActive}
        />

        {/* Active chips + summary */}
        <div className="mt-4 flex flex-col gap-3">
          {hasActive && (
            <ActiveFilterChips
              q={filters.q}
              domain={filters.domain}
              location={filters.location}
              workType={filters.workType}
              onRemove={handleRemoveChip}
            />
          )}
          {resultSummary && (
            <p className="text-[13px] text-secondary" aria-live="polite" aria-atomic="true">
              {resultSummary}
            </p>
          )}
        </div>

        {/* Results */}
        <div ref={resultsRef} tabIndex={-1} className="mt-6 outline-none" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface border border-default rounded-[12px] p-5 sm:p-6 animate-pulse" aria-hidden="true">
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-24 bg-muted rounded-[8px]" />
                    <div className="h-6 w-20 bg-muted rounded-[8px]" />
                  </div>
                  <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-40 bg-subtle rounded mb-3" />
                  <div className="h-4 w-full bg-subtle rounded mb-1.5" />
                  <div className="h-4 w-5/6 bg-subtle rounded" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-surface border border-default rounded-[12px] p-8 sm:p-10 text-center">
              <h2 className="text-[18px] font-semibold text-primary">We couldn’t load opportunities.</h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">
                Please try again. If the problem continues, contact Rolemino at{' '}
                <a href="mailto:careers@rolemino.com" className="text-brand underline underline-offset-4 hover:text-[var(--color-action-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm">
                  careers@rolemino.com
                </a>
                .
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[14px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
                >
                  Try again
                </button>
                <a
                  href="mailto:careers@rolemino.com"
                  className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-[10px] border border-brand bg-surface text-brand text-[14px] font-medium hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
                >
                  Contact Rolemino
                </a>
              </div>
            </div>
          ) : noActiveOpportunities ? (
            <div className="bg-surface border border-default rounded-[12px] p-8 sm:p-10 text-center">
              <h2 className="text-[18px] font-semibold text-primary">No opportunities are available right now.</h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">
                New opportunities are added as project needs become available. Please check back again.
              </p>
            </div>
          ) : noSearchResults ? (
            <div className="bg-surface border border-default rounded-[12px] p-8 sm:p-10 text-center">
              <h2 className="text-[18px] font-semibold text-primary">No opportunities match your search.</h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">Try changing your search or clearing one or more filters.</p>
              <button
                type="button"
                onClick={handleClearAll}
                className="mt-6 inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[14px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {pageItems.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </div>

        {/* Trust note */}
        <div className="mt-10 bg-subtle border border-default rounded-[10px] px-4 py-3">
          <p className="text-[13px] leading-[1.6] text-secondary">
            Rolemino does not charge application, registration or placement fees. Official communication is sent through{' '}
            <a href="mailto:careers@rolemino.com" className="text-brand underline underline-offset-4 hover:text-[var(--color-action-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm">
              careers@rolemino.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
