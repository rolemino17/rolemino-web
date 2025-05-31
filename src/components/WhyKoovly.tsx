import { motion } from 'framer-motion';

const benefits = [
  { title: 'Work from Anywhere', description: 'Enjoy the freedom to work from home or any location.' },
  { title: 'Flexible Hours', description: 'Set your own schedule to suit your lifestyle.' },
  { title: 'Competitive Pay', description: 'Earn attractive compensation for your skills.' },
  { title: 'Quick Payments', description: 'Get paid promptly with multiple payment options.' },
  { title: 'Crypto Support', description: 'Receive payments in cryptocurrency if preferred.' },
  { title: 'Easy Application', description: 'Apply to jobs with a streamlined process.' },
];

export function WhyKoovly() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      id='why-koovly'
      className="py-20 bg-secondary"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-primary text-center mb-4">Why Choose Koovly?</h2>
        <p className="text-lg text-gray-800 text-center mb-12">
          Discover the benefits of joining our remote work platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 * index }}
              className="p-6 bg-white rounded-lg shadow-sm text-center"
            >
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}