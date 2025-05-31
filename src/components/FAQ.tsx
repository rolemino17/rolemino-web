import { useState } from 'react';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'What is Koovly?',
    answer: 'Koovly is a platform connecting remote workers with global job opportunities, offering flexible work and seamless payments.'
  },
  {
    question: 'Who can apply for jobs on Koovly?',
    answer: 'Anyone with the required skills can apply, including students, professionals, and retirees, regardless of location.'
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support bank transfers, PayPal, and cryptocurrency payments for maximum flexibility.'
  },
  {
    question: 'How long does the verification process take?',
    answer: 'Verification typically takes 1-12 hours after submitting all required documents.'
  },
  {
    question: 'Are there any fees to join Koovly?',
    answer: 'No, joining Koovly is free. You only need to apply to jobs that interest you.'
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      id="faq"
      className="py-20 bg-white"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-primary text-center mb-12">Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.question}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 * index }}
            className="mb-4"
          >
            <button
              className="w-full cursor-pointer text-left p-4 bg-secondary rounded-lg flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="text-lg font-semibold">{faq.question}</span>
              <span>{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className="p-4 bg-secondary text-gray-800">{faq.answer}</div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}