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
      className="p-4 bg-white rounded-lg shadow-sm relative h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
      {/* <p className="text-gray-600 mb-2 italic font-light">{job.responsibilities}</p> */}
      <p className="text-gray-600 mb-8 font-medium">{job.description.substring(0, 200)}...</p>
      <div className='flex items-center gap-4 mb-3 absolute bottom-0 mt-4'>
        <p className="text-gray-800 text-sm flex items-center justify-center px-3 py-1  bg-[#c3c3c3] rounded-[25px] shadow-sm">{job.location.split(',', 1)}</p>
        <p className="text-gray-800 text-sm flex items-center justify-center px-3 py-1 bg-[#c3c3c3] rounded-[25px] shadow-sm">{job.locationType}</p>
        <p className="text-gray-800 text-sm flex items-center justify-center px-3 py-1 bg-[#c3c3c3] rounded-[25px] shadow-sm">{job.compensation}</p>
      </div>
      {/* <div className="flex items-center justify-center">
          <Button variant="primary" onClick={() => navigate(`/jobs/${job.id}/apply`)}>
            Apply Now
          </Button>
      </div> */}

    </motion.div>
  );
}