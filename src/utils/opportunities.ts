import type { Job } from '../types';

/**
 * Backend currently has no explicit active-status field.
 * If a future field (`isActive`, `status`, `isPublished`) appears, filter accordingly.
 * Otherwise, trust that GET /jobs already returns only active opportunities.
 */
export function filterActive(jobs: Job[]): Job[] {
  if (!jobs.length) return jobs;
  // Check for common active-status patterns without inventing rules
  const sample = jobs[0] as unknown as Record<string, unknown>;
  const hasActiveField =
    'isActive' in sample ||
    'active' in sample ||
    'isPublished' in sample ||
    'status' in sample;

  if (!hasActiveField) return jobs;

  return jobs.filter((job) => {
    const r = job as unknown as Record<string, unknown>;
    if ('isActive' in r) return r.isActive !== false;
    if ('active' in r) return r.active !== false;
    if ('isPublished' in r) return r.isPublished !== false;
    if ('status' in r) {
      const s = String(r.status).toLowerCase();
      return s === 'active' || s === 'open' || s === 'published';
    }
    return true;
  });
}

export function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase();
}

export function matchesSearch(job: Job, rawTerm: string): boolean {
  const term = normalizeSearchTerm(rawTerm);
  if (!term) return true;
  const haystack = [
    job.title,
    job.domain,
    job.description,
    ...(job.qualifications ?? []),
    ...(job.responsibilities ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(term);
}

export function getUniqueOptions(jobs: Job[], key: 'domain' | 'location' | 'locationType'): string[] {
  const set = new Set<string>();
  for (const j of jobs) {
    const v = (j[key] ?? '').toString().trim();
    if (v) set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export type OpportunityFilters = {
  q: string;
  domain: string;
  location: string;
  workType: string;
  page: number;
};

export const DEFAULT_FILTERS: OpportunityFilters = {
  q: '',
  domain: '',
  location: '',
  workType: '',
  page: 1,
};

export function parseQuery(search: string, validOptions: { domains: string[]; locations: string[]; workTypes: string[] }): OpportunityFilters {
  const params = new URLSearchParams(search);
  const rawQ = params.get('q') ?? '';
  const rawDomain = params.get('domain') ?? '';
  const rawLocation = params.get('location') ?? '';
  const rawWorkType = params.get('workType') ?? '';
  const rawPage = params.get('page') ?? '';

  // normalize - if value not in valid options, ignore
  const domain = validOptions.domains.includes(rawDomain) ? rawDomain : '';
  const location = validOptions.locations.includes(rawLocation) ? rawLocation : '';
  const workType = validOptions.workTypes.includes(rawWorkType) ? rawWorkType : '';

  let page = parseInt(rawPage, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  return {
    q: rawQ,
    domain,
    location,
    workType,
    page,
  };
}

export function serializeQuery(filters: OpportunityFilters): string {
  const p = new URLSearchParams();
  const qTrim = filters.q.trim();
  if (qTrim) p.set('q', qTrim);
  if (filters.domain) p.set('domain', filters.domain);
  if (filters.location) p.set('location', filters.location);
  if (filters.workType) p.set('workType', filters.workType);
  if (filters.page > 1) p.set('page', String(filters.page));
  return p.toString();
}

export function filterJobsClient(jobs: Job[], filters: Omit<OpportunityFilters, 'page'>): Job[] {
  return jobs.filter((job) => {
    if (!matchesSearch(job, filters.q)) return false;
    if (filters.domain && job.domain !== filters.domain) return false;
    if (filters.location && job.location !== filters.location) return false;
    if (filters.workType && job.locationType !== filters.workType) return false;
    return true;
  });
}

export function paginate<T>(items: T[], page: number, perPage: number): { pageItems: T[]; totalPages: number; currentPage: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perPage;
  return {
    pageItems: items.slice(start, start + perPage),
    totalPages,
    currentPage,
  };
}

export function hasActiveFilters(filters: OpportunityFilters): boolean {
  return Boolean(filters.q.trim() || filters.domain || filters.location || filters.workType);
}

export function cleanValue(v: string | undefined | null): string {
  return v ? v.trim() : '';
}
