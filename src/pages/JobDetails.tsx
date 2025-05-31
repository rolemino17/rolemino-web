import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob } from '../api/api';
import { Job } from '../types';
import { Button } from '../components/Button';

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: () => getJob(id!),
  });

  if (!job) return <div className="pt-20 text-center text-gray-600">Loading...</div>;

  return (
    <div className="pt-20 lg:pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">{job.title} <span className="text-gray-600 capitalize">({job.location})</span></h1>
         <div className="flex items-center gap-2 mb-4">
           <p className='text-xs font-light flex items-center justify-center px-3 py-1  bg-[#c3c3c3] rounded-[25px] shadow-sm'> {job.locationType}</p>
            <p className='text-xs font-light flex items-center justify-center px-3 py-1  bg-[#c3c3c3] rounded-[25px] shadow-sm'> {job.domain}</p>
            <p className='text-xs font-light flex items-center justify-center px-3 py-1  bg-[#c3c3c3] rounded-[25px] shadow-sm'> {job.compensation || 'N/A'}</p>
         </div>
        <div className="p-6 space-y-4 bg-gray-200 text-gray-700 text-sm">
          <p > {job.description}</p>
          <p><strong>Responsibilities:</strong></p>
          <ul className="list-disc list-inside">
            {job.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
          <p><strong>Qualifications:</strong></p>
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
            variant="secondary"
            className="mt-4 w-full sm:w-auto"
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
          >
            Apply for this Job Now
          </Button>
        </div>
      </div>
    </div>
  );
}