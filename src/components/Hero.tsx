import { Button } from './Button';
import heroImage from '../assets/hero2.jpg';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      id='hero'
      className="min-h-screen flex items-center bg-gradient-to-r from-primary to-accent text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left text-purple-500">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Work Remotely, <span className='text-blue-500'>Earn Seamlessly</span>
          </h1>
          <p className="text-lg mb-6">
            Join Rolemino to access global remote job opportunities and get paid hassle-free in your preferred method.
          </p>
          <Button variant="secondary" onClick={() => window.location.href = '/jobs'}>
            Apply for Jobs
          </Button>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <img src={heroImage} alt="People working remotely" className="rounded-lg shadow-lg" />
        </div>
      </div>
    </motion.section>
  );
}
