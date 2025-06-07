import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-[10px] font-medium cursor-pointer transition duration-500 transition-colors';
  const variantStyles = {
    secondary: 'bg-primary text-white hover:bg-blue-900 transition duration-700 ',
    primary: 'bg-secondary text-white hover:bg-gray-300 transition duration-700 ',
    accent: 'bg-accent text-white hover:bg-purple-800 transition duration-500 ',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}