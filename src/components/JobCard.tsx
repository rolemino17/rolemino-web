import { Job } from '../types';
// import { Button } from './Button';
import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  // const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-surface rounded-lg shadow-sm border border-default relative h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold mb-2 text-primary">{job.title}</h3>
      {/* <p className="text-secondary mb-2 italic font-light">{job.responsibilities}</p> */}
      <p className="text-secondary mb-8 font-medium">{job.description.substring(0, 200)}...</p>
      <div className='flex items-center gap-4 mb-3 absolute bottom-0 mt-4'>
        <p className="text-strong-secondary text-sm flex items-center justify-center px-3 py-1  bg-subtle border border-default rounded-[25px] shadow-sm text-strong-secondary">{job.location.split(',', 1)}</p>
        <p className="text-strong-secondary text-sm flex items-center justify-center px-3 py-1 bg-subtle border border-default rounded-[25px] shadow-sm text-strong-secondary">{job.locationType}</p>
        <p className="text-strong-secondary text-sm flex items-center justify-center px-3 py-1 bg-subtle border border-default rounded-[25px] shadow-sm text-strong-secondary">{job.compensation}</p>
      </div>
      {/* <div className="flex items-center justify-center">
          <Button variant="primary" onClick={() => navigate(`/jobs/${job.id}/apply`)}>
            Apply Now
          </Button>
      </div> */}

    </motion.div>
  );
}