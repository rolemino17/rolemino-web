import { motion } from 'framer-motion';
import avatar1 from '../assets/avatars/avatar1.jpg';
import avatar2 from '../assets/avatars/avatar2.jpg';
import avatar3 from '../assets/avatars/avatar3.jpg';
import avatar4 from '../assets/avatars/avatar4.jpg';
import avatar5 from '../assets/avatars/avatar5.jpg';

const stats = [
  { label: 'Active Remote Workers', value: '10,000+' },
  { label: 'Active Countries', value: '50+' },
  { label: 'Languages', value: '20+' },
  { label: 'Total Earnings', value: '$1M+' },
];

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5];

export function Statistics() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      id='statistics'
      className="py-20 bg-secondary"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">Join Our Global Community</h2>
        <p className="text-lg text-gray-800 mb-12">
          From students to professionals, Koovly connects diverse talent to remote opportunities worldwide.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 * index }}
              className="p-6 bg-white rounded-lg shadow-sm"
            >
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex justify-around space-x-4">
          {avatars.map((avatar, idx) => (
            <motion.img key={idx}
              src={avatar}
              alt={`User ${idx + 1}`}
              className="w-18 h-14 rounded-full border-2 border-white"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.2 }}
              />
          ))}
        </div>
      </div>
    </motion.section>
  );
}