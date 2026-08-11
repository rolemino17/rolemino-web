import { motion } from 'framer-motion';
import journeyImage from '../assets/user-journey.jpg';

const steps = [
  { title: 'Apply for Jobs', description: 'Browse and apply to remote jobs with a single click.' },
  { title: 'Submit Details', description: 'Provide your skills, resume, and personal information.' },
  { title: 'Sign Documents', description: 'Complete secure digital verification and agreements.' },
  { title: 'Get Hired & Paid', description: 'Start working and receive payments in your preferred method.' },
];

export function UserJourney() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      id='user-journey'
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <img src={journeyImage} alt="Journey Journey" className="rounded-lg shadow-lg" />
        </div>
        <div className="md:w-1/2 md:pl-8">
          <h2 className="text-3xl font-bold text-primary mb-4">Your Journey with Rolemino</h2>
          <p className="text-lg text-gray-600 mb-6">
            From application to payment, we make remote work simple and rewarding.
          </p>
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 * index }}
              className="mb-4"
            >
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-4">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
