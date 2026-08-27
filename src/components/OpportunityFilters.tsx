import { useState } from 'react';

type Props = {
  q: string;
  onQChange: (v: string) => void;
  domain: string;
  onDomainChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  workType: string;
  onWorkTypeChange: (v: string) => void;
  domains: string[];
  locations: string[];
  workTypes: string[];
  onClearAll: () => void;
  hasActive: boolean;
};

export function OpportunityFilters({
  q,
  onQChange,
  domain,
  onDomainChange,
  location,
  onLocationChange,
  workType,
  onWorkTypeChange,
  domains,
  locations,
  workTypes,
  onClearAll,
  hasActive,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectClass =
    'w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-default bg-surface text-[14px] text-primary focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none hover:border-strong transition-colors';

  const renderSelect = (
    id: string,
    label: string,
    value: string,
    options: string[],
    onChange: (v: string) => void,
    allLabel: string,
  ) => {
    if (options.length === 0) return null;
    return (
      <div className="flex-1 min-w-[160px]">
        <label htmlFor={id} className="block text-[12px] font-medium text-strong-secondary mb-1.5">
          {label}
        </label>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
          <option value="">{allLabel}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="bg-surface border border-default rounded-[12px] p-4 sm:p-5">
      {/* Search */}
      <div className="mb-4">
        <label htmlFor="opportunity-search" className="block text-[12px] font-medium text-strong-secondary mb-1.5">
          Search opportunities
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11 11l2.5 2.5M13 7.5A5.5 5.5 0 112 7.5a5.5 5.5 0 0111 0z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="opportunity-search"
            type="search"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder="Search by title, domain or keyword"
            className="w-full pl-10 pr-3 py-2.5 min-h-[44px] rounded-[10px] border border-default bg-surface text-[14px] text-primary placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none hover:border-strong transition-colors"
          />
        </div>
      </div>

      {/* Desktop filters */}
      <div className="hidden sm:flex flex-wrap gap-3 items-end">
        {renderSelect('filter-domain', 'Domain', domain, domains, onDomainChange, 'All domains')}
        {renderSelect('filter-location', 'Country eligibility', location, locations, onLocationChange, 'All locations')}
        {renderSelect('filter-workType', 'Work arrangement', workType, workTypes, onWorkTypeChange, 'All arrangements')}
        {hasActive && (
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-[44px] px-4 inline-flex items-center justify-center rounded-[10px] border border-default bg-surface text-[13px] font-medium text-primary hover:bg-subtle hover:border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Mobile disclosure */}
      <div className="sm:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-filters-panel"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full min-h-[44px] px-4 inline-flex items-center justify-between rounded-[10px] border border-default bg-surface text-[14px] font-medium text-primary hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 5h10M5 8h6M7 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Filters {hasActive && <span className="ml-1 w-2 h-2 rounded-full bg-decorative" aria-hidden="true" />}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="mobile-filters-panel" className={`${mobileOpen ? 'block' : 'hidden'} mt-3 space-y-3`}>
          {renderSelect('filter-domain-m', 'Domain', domain, domains, onDomainChange, 'All domains')}
          {renderSelect('filter-location-m', 'Country eligibility', location, locations, onLocationChange, 'All locations')}
          {renderSelect('filter-workType-m', 'Work arrangement', workType, workTypes, onWorkTypeChange, 'All arrangements')}
          {hasActive && (
            <button
              type="button"
              onClick={() => {
                onClearAll();
                setMobileOpen(false);
              }}
              className="w-full min-h-[44px] px-4 inline-flex items-center justify-center rounded-[10px] border border-default bg-surface text-[13px] font-medium text-primary hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActiveFilterChips({
  q,
  domain,
  location,
  workType,
  onRemove,
}: {
  q: string;
  domain: string;
  location: string;
  workType: string;
  onRemove: (key: 'q' | 'domain' | 'location' | 'workType') => void;
}) {
  const chips: { key: 'q' | 'domain' | 'location' | 'workType'; label: string; value: string }[] = [];
  if (q.trim()) chips.push({ key: 'q', label: 'Search', value: `“${q.trim()}”` });
  if (domain) chips.push({ key: 'domain', label: 'Domain', value: domain });
  if (location) chips.push({ key: 'location', label: 'Location', value: location });
  if (workType) chips.push({ key: 'workType', label: 'Arrangement', value: workType });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      <span className="text-[12px] font-medium text-strong-secondary">Active:</span>
      {chips.map((c) => (
        <span key={c.key} className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full bg-subtle border border-default text-[12px] font-medium text-strong-secondary">
          <span>
            {c.label}: {c.value}
          </span>
          <button
            type="button"
            onClick={() => onRemove(c.key)}
            aria-label={`Remove ${c.label} filter`}
            className="w-6 h-6 inline-flex items-center justify-center rounded-full hover:bg-surface border border-transparent hover:border-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
