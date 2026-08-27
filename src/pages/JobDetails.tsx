import { useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJob } from '../api/api';
import type { Job } from '../types';
import axios from 'axios';

function clean(v: string | undefined | null) {
  return v?.trim() ?? '';
}

function isUnavailableError(err: unknown): boolean {
  if (axios.isAxiosError(err) && err.response) {
    const s = err.response.status;
    return s === 404 || s === 410;
  }
  return false;
}

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: job, isLoading, isError, error } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: () => getJob(id!),
    enabled: Boolean(id),
    retry: false,
  });

  const isUnavailable = isError && isUnavailableError(error);

  // SEO
  useEffect(() => {
    if (job) {
      document.title = `${job.title} | Rolemino`;
      const desc = clean(job.description).slice(0, 155) || 'Professional project opportunity through Rolemino.';
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', desc);
    } else if (isUnavailable) {
      document.title = 'Opportunity unavailable | Rolemino';
    } else if (!isLoading) {
      document.title = 'Opportunity | Rolemino';
    }
  }, [job, isUnavailable, isLoading]);

  // Back link with preserved query
  const fromSearch: string | undefined = (location.state as { fromSearch?: string })?.fromSearch;
  const storedSearch = (() => {
    try {
      return sessionStorage.getItem('jobs-search') ?? '';
    } catch {
      return '';
    }
  })();
  const backSearch = fromSearch ?? (storedSearch ? `?${storedSearch}` : '');
  const backHref = `/jobs${backSearch}`;

  if (isLoading) {
    return (
      <div className="pt-16 bg-canvas min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 w-40 bg-muted rounded animate-pulse mb-8" />
          <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-8">
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-subtle rounded animate-pulse" />
              <div className="h-32 bg-surface border border-default rounded-[12px] animate-pulse" />
            </div>
            <div className="h-64 bg-surface border border-default rounded-[12px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    if (isUnavailable) {
      return (
        <div className="pt-16 bg-canvas min-h-screen">
          <main id="main-content" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-[13px] text-secondary">
                <li>
                  <Link to="/jobs" className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm">
                    Opportunities
                  </Link>
                </li>
                <li aria-hidden="true" className="text-muted">/</li>
                <li aria-current="page" className="text-primary">Unavailable</li>
              </ol>
            </nav>
            <div className="bg-surface border border-default rounded-[12px] p-8 sm:p-10 text-center max-w-[720px] mx-auto">
              <h1 className="text-[22px] sm:text-[24px] font-semibold text-primary">This opportunity is no longer available.</h1>
              <p className="mt-3 text-[14px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">
                The project may have closed or is no longer accepting applications. Explore current opportunities to find other work suited to your experience.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/jobs"
                  className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[14px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
                >
                  Explore current opportunities
                </Link>
                <a
                  href="mailto:careers@rolemino.com"
                  className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] border border-brand bg-surface text-brand text-[14px] font-medium hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
                >
                  Contact Rolemino
                </a>
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Generic API error
    const msg = error instanceof Error ? error.message : 'Please try again.';
    return (
      <div className="pt-16 bg-canvas min-h-screen">
        <main id="main-content" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface border border-default rounded-[12px] p-8 sm:p-10 text-center max-w-[720px] mx-auto">
            <h1 className="text-[18px] font-semibold text-primary">We couldn’t load this opportunity.</h1>
            <p className="mt-2 text-[14px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">{msg}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[14px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
              >
                Try again
              </button>
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] border border-default bg-surface text-primary text-[14px] font-medium hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
              >
                Back to opportunities
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!job) return null;

  const domain = clean(job.domain);
  const country = clean(job.location);
  const workType = clean(job.locationType);
  const compensation = clean(job.compensation);
  const description = clean(job.description);
  const responsibilities = (job.responsibilities ?? []).map(clean).filter(Boolean);
  const qualifications = (job.qualifications ?? []).map(clean).filter(Boolean);

  // Split description into paragraphs preserving line breaks
  const paragraphs = description ? description.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean) : [];

  return (
    <div className="pt-16 bg-canvas min-h-screen">
      <main id="main-content" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-[13px] text-secondary">
            <li>
              <Link to={backHref} className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm">
                Opportunities
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">/</li>
            <li aria-current="page" className="font-medium text-primary line-clamp-1 max-w-[32ch] sm:max-w-none">
              {job.title}
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-6 lg:gap-8 items-start">
          {/* Main */}
          <div>
            {/* Header */}
            <div className="bg-surface border border-default rounded-[12px] p-6 sm:p-7">
              <div className="flex flex-wrap gap-2 mb-3">
                {domain && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-subtle border border-default text-strong-secondary">
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
              <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight leading-[1.15] text-primary break-words">{job.title}</h1>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-secondary">
                {country && (
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="text-muted">▸</span> Country eligibility: <span className="font-medium text-strong-secondary">{country}</span>
                  </span>
                )}
                {workType && (
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="text-muted">▸</span> Work arrangement: <span className="font-medium text-strong-secondary">{workType}</span>
                  </span>
                )}
              </div>

              {/* Mobile summary CTA */}
              <div className="mt-6 lg:hidden flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}/apply`)}
                  className="w-full inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[15px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
                >
                  Apply for this opportunity
                </button>
                <Link
                  to={backHref}
                  className="w-full inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] border border-brand bg-surface text-brand text-[14px] font-medium hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
                >
                  Back to opportunities
                </Link>
                <p className="text-center text-[12px] text-secondary">No application or placement fees.</p>
              </div>
            </div>

            {/* Overview */}
            {paragraphs.length > 0 && (
              <section className="mt-6 bg-surface border border-default rounded-[12px] p-6 sm:p-7">
                <h2 className="text-[16px] font-semibold text-primary">About this opportunity</h2>
                <div className="mt-3 space-y-3">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-[14px] leading-[1.7] text-secondary">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <section className="mt-6 bg-surface border border-default rounded-[12px] p-6 sm:p-7">
                <h2 className="text-[16px] font-semibold text-primary">Responsibilities</h2>
                <ul className="mt-3 list-disc pl-5 space-y-2">
                  {responsibilities.map((r, i) => (
                    <li key={i} className="text-[14px] leading-[1.6] text-secondary break-words">
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Qualifications */}
            {qualifications.length > 0 && (
              <section className="mt-6 bg-surface border border-default rounded-[12px] p-6 sm:p-7">
                <h2 className="text-[16px] font-semibold text-primary">Qualifications</h2>
                <ul className="mt-3 list-disc pl-5 space-y-2">
                  {qualifications.map((q, i) => (
                    <li key={i} className="text-[14px] leading-[1.6] text-secondary break-words">
                      {q}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Compensation */}
            {compensation && (
              <section className="mt-6 bg-surface border border-default rounded-[12px] p-6 sm:p-7">
                <h2 className="text-[16px] font-semibold text-primary">Compensation</h2>
                <p className="mt-2 text-[14px] font-medium text-primary">{compensation}</p>
                <p className="mt-2 text-[13px] leading-[1.6] text-secondary">Compensation and payment terms are confirmed before project participation begins.</p>
              </section>
            )}

            {/* What happens after you apply */}
            <section className="mt-6 bg-surface border border-default rounded-[12px] p-6 sm:p-7">
              <h2 className="text-[16px] font-semibold text-primary">What happens after you apply</h2>
              <ol className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-inverse flex items-center justify-center text-[12px] font-semibold">1</span>
                  <div>
                    <p className="text-[14px] font-medium text-primary">Application review</p>
                    <p className="text-[13px] leading-[1.6] text-secondary">Rolemino reviews your application against the opportunity requirements.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-inverse flex items-center justify-center text-[12px] font-semibold">2</span>
                  <div>
                    <p className="text-[14px] font-medium text-primary">Qualification</p>
                    <p className="text-[13px] leading-[1.6] text-secondary">You may be asked to complete additional assessment or verification where required.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-inverse flex items-center justify-center text-[12px] font-semibold">3</span>
                  <div>
                    <p className="text-[14px] font-medium text-primary">Project-owner introduction</p>
                    <p className="text-[13px] leading-[1.6] text-secondary">Qualified candidates are introduced to the project owner.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-inverse flex items-center justify-center text-[12px] font-semibold">4</span>
                  <div>
                    <p className="text-[14px] font-medium text-primary">Final decision</p>
                    <p className="text-[13px] leading-[1.6] text-secondary">The project owner makes the final selection decision. Rolemino continues tracking contributor progress.</p>
                  </div>
                </li>
              </ol>
              <p className="mt-4 text-[13px] leading-[1.6] text-secondary bg-subtle border border-default rounded-[10px] px-4 py-3">
                Submitting an application does not guarantee selection.
              </p>
            </section>

            {/* Fees and payments */}
            <section className="mt-6 bg-surface border border-default rounded-[12px] p-6 sm:p-7">
              <h2 className="text-[16px] font-semibold text-primary">Fees and payments</h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-secondary">Applying through Rolemino is free. Contributors are not charged application, registration or placement fees.</p>
              <p className="mt-2 text-[14px] leading-[1.6] text-secondary">
                Rolemino handles contributor payments through its verified project-owner pipeline. Supported methods include direct bank transfer, PayPal and Payoneer. Available methods,
                currency and payment schedules may vary by project and contributor location.
              </p>
            </section>

            {/* Official communication */}
            <section className="mt-6 bg-surface border border-default rounded-[12px] p-6 sm:p-7">
              <h2 className="text-[16px] font-semibold text-primary">Official communication</h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-secondary">
                Official contributor communication is sent through{' '}
                <a href="mailto:careers@rolemino.com" className="text-brand underline underline-offset-4 hover:text-[var(--color-action-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm">
                  careers@rolemino.com
                </a>
                . Rolemino does not request application or placement fees.
              </p>
            </section>
          </div>

          {/* Summary panel - desktop sticky */}
          <aside className="hidden lg:block lg:sticky lg:top-[76px] self-start">
            <div className="bg-surface border border-default rounded-[12px] p-6">
              <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-strong-secondary">Opportunity summary</h2>
              <dl className="mt-4 space-y-3">
                {domain && (
                  <div className="flex justify-between gap-4 py-2 border-b border-subtle">
                    <dt className="text-[13px] text-secondary">Domain</dt>
                    <dd className="text-[13px] font-medium text-primary text-right">{domain}</dd>
                  </div>
                )}
                {country && (
                  <div className="flex justify-between gap-4 py-2 border-b border-subtle">
                    <dt className="text-[13px] text-secondary">Country eligibility</dt>
                    <dd className="text-[13px] font-medium text-primary text-right break-all">{country}</dd>
                  </div>
                )}
                {workType && (
                  <div className="flex justify-between gap-4 py-2 border-b border-subtle">
                    <dt className="text-[13px] text-secondary">Work arrangement</dt>
                    <dd className="text-[13px] font-medium text-primary text-right">{workType}</dd>
                  </div>
                )}
                {compensation && (
                  <div className="flex justify-between gap-4 py-2 border-b border-subtle">
                    <dt className="text-[13px] text-secondary">Compensation</dt>
                    <dd className="text-[13px] font-medium text-primary text-right">{compensation}</dd>
                  </div>
                )}
              </dl>
              <button
                type="button"
                onClick={() => navigate(`/jobs/${job.id}/apply`)}
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[14px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
              >
                Apply for this opportunity
              </button>
              <p className="mt-2 text-center text-[12px] text-secondary">No application or placement fees.</p>
              <Link
                to={backHref}
                className="mt-3 w-full inline-flex items-center justify-center px-6 py-2.5 min-h-[44px] rounded-[10px] border border-default bg-surface text-primary text-[13px] font-medium hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
              >
                Back to opportunities
              </Link>
            </div>
            <div className="mt-4 bg-subtle border border-default rounded-[10px] px-4 py-3">
              <p className="text-[12px] leading-[1.6] text-secondary">
                Questions? Contact{' '}
                <a href="mailto:careers@rolemino.com" className="text-brand underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm">
                  careers@rolemino.com
                </a>
                .
              </p>
            </div>
          </aside>
        </div>

        {/* Mobile sticky apply bar - ensure not covering */}
        <div className="lg:hidden h-20" aria-hidden="true" />
      </main>

      {/* Mobile persistent action */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-default p-3 safe-area-inset">
        <button
          type="button"
          onClick={() => navigate(`/jobs/${job.id}/apply`)}
          className="w-full inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[15px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
        >
          Apply for this opportunity
        </button>
      </div>
    </div>
  );
}
