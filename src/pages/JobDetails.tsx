import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob } from '../api/api';
import { Job } from '../types';
import { Button } from '../components/Button';
import { Loading } from '../components/LoadingSpinner';
import { useEffect } from 'react';

export function JobDetails() {
    useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: () => getJob(id!),
  });

  if (!job) return <Loading />;

  return (
    <div className="pt-20 lg:pt-28 pb-12 bg-canvas">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-lg lg:text-3xl font-bold capitalize mb-2">{job.title} <span className="text-secondary text-xs md:text-base capitalize">({job.location})</span></h1>
         <div className="flex items-center gap-2 mb-4">
           <p className='text-xs font-medium flex items-center justify-center px-3 py-1 bg-subtle rounded-[25px] border border-default shadow-sm text-strong-secondary'> {job.locationType}</p>
            <p className='text-xs font-medium flex items-center justify-center px-3 py-1 bg-subtle rounded-[25px] border border-default shadow-sm text-strong-secondary'> {job.domain}</p>
            <p className='text-xs font-medium flex items-center justify-center px-3 py-1 bg-subtle rounded-[25px] border border-default shadow-sm text-strong-secondary'> {job.compensation || 'N/A'}</p>
         </div>
        <div className="p-6 space-y-4 bg-surface text-secondary text-sm border border-default rounded-lg">
          <p > {job.description}</p>
          <p><strong className="text-primary">Responsibilities:</strong></p>
          <ul className="list-disc list-inside">
            {job.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
          {job.benefits && (
            <>
              <p><strong className="text-primary">Benefits:</strong></p>
              <ul className="list-disc list-inside">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </>
          )}
          <p><strong className="text-primary">Qualifications:</strong></p>
          <ul className="list-disc list-inside">
            {job.qualifications.map((qual, index) => (
              <li key={index}>{qual}</li>
            ))}
          </ul>

          <h2 className='font-bold'>
            Interested?
          <p className='font-normal'>If you meet the qualifications and ready to join this project, apply now!</p>

          </h2>
          <Button
            variant="primary"
            className="mt-4 w-full sm:w-auto"
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}