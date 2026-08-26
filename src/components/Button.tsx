import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-[10px] font-medium cursor-pointer transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = {
    // Primary: Midnight navy, white text; hover brand-800, active brand-900
    primary:
      'bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-active)] border border-transparent shadow-sm',
    // Secondary: white surface + brand text + brand border; hover brand-50, active brand-100
    secondary:
      'bg-[var(--color-action-secondary-bg)] text-brand border border-brand hover:bg-[var(--color-action-secondary-hover)] active:bg-[var(--color-action-secondary-active)] shadow-sm',
    // Accent: brass with Ink text (AA); hover accent-600; rare premium CTA
    accent:
      'bg-[var(--color-action-accent)] text-primary hover:bg-[var(--color-action-accent-hover)] active:bg-[var(--color-action-accent-active)] border border-transparent shadow-sm',
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