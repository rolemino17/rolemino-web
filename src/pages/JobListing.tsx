import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getJobs, filterJobs } from '../api/api';
import { Job } from '../types';
import { Button } from '../components/Button';
import { countries } from '../data/CountryList';

const locationTypes = ['Remote', 'On-site', 'Hybrid'];
const domains = ['Engineering', 'Data Collection', 'Generalist', 'Search Evaluation', 'Translation', 'Social Media', 'Linguistics', 'Other'];

export function JobListing() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ location: '', locationType: '', domain: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['jobs', filters],
    queryFn: () => (filters.location || filters.locationType || filters.domain ? filterJobs(filters) : getJobs()),
  });

  const handleFilterChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <motion.div
      className="pt-20 lg:pt-[100px] pb-12 bg-canvas min-h-screen"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl lg:w-[60%] mx-auto px-4 sm:px-6">
        {/* Filter Section */}
        <section className="font-inter">
          <div className="w-full flex justify-around">
            {/* Mobile Filter Dropdown */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary flex justify-between hover:border-strong items-center"
              >
                <span>Filters</span>
                <svg
                  className={`w-4 h-4 transform ${isFilterOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isFilterOpen && (
                <div className="mt-2 space-y-2 animate-fadeIn">
                  <select
                    value={filters.location}
                    onChange={handleFilterChange('location')}
                    className="w-full p-2 border border-default rounded-md bg-surface text-primary hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                  >
                    <option value="">All Locations</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <select
                    value={filters.locationType}
                    onChange={handleFilterChange('locationType')}
                    className="w-full p-2 border border-default rounded-md bg-surface text-primary hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                  >
                    <option value="">All Location Types</option>
                    {locationTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={filters.domain}
                    onChange={handleFilterChange('domain')}
                    className="w-full p-2 border border-default rounded-md bg-surface text-primary hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                  >
                    <option value="">All Domains</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* Desktop Filter Layout */}
            <div className="hidden sm:flex mb-8 flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <select
                value={filters.location}
                onChange={handleFilterChange('location')}
                className="p-2 border rounded-md w-fit bg-surface text-primary border border-default hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              >
                <option value="">All Locations</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select
                value={filters.locationType}
                onChange={handleFilterChange('locationType')}
                className="p-2 border border-default rounded-md bg-surface text-primary hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              >
                <option value="">All Location Types</option>
                {locationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filters.domain}
                onChange={handleFilterChange('domain')}
                className="p-2 border border-default rounded-md bg-surface text-primary hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              >
                <option value="">All Domains</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <div className="mt-4 flex flex-col items-center justify-center gap-6">
          {jobs?.length ? (
            jobs.map((job) => (
              <div
                onClick={() => navigate(`/jobs/${job.id}`)}
                key={job.id}
                className="w-full cursor-pointer bg-surface p-4 border border-default hover:bg-brand-subtle transition-colors duration-200 flex justify-between gap-2 items-start"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-primary">
                   URGENTLY HIRING:{" "} {job.title} <span className="text-xs block md:inline text-secondary">({job.locationType})</span>
                  </h3>
                  {/* Job Tags with Arrow Separator */}
                  <div className="text-[8px] md:text-sm whitespace-nowrap text-secondary flex items-center gap-1">
                    {job.location && <p>{job.location}</p>}
                    {(job.location && (job.domain || job.compensation)) && <span className="text-muted">-</span>}
                    {job.domain && <p>{job.domain}</p>}
                    {(job.domain && job.compensation) && <span className="text-muted">-</span>}
                    {job.compensation && <p>{job.compensation}</p>}
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="rounded-2xl text-sm px-2 py-1"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  Apply
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-secondary">No jobs available.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
