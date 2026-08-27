import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-5 py-2.5 rounded-[10px] font-medium cursor-pointer text-[15px] leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';
  const variantStyles = {
    primary:
      'bg-[var(--color-action-primary)] text-inverse hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-active)] border border-transparent shadow-sm',
    secondary:
      'bg-[var(--color-action-secondary-bg)] text-brand border border-brand hover:bg-[var(--color-action-secondary-hover)] active:bg-[var(--color-action-secondary-active)] shadow-sm',
    accent:
      'bg-[var(--color-action-accent)] text-primary hover:bg-[var(--color-action-accent-hover)] active:bg-[var(--color-action-accent-active)] border border-transparent shadow-sm',
    ghost:
      'bg-transparent text-brand border border-transparent hover:bg-[var(--color-action-ghost-hover)] active:bg-brand-selected',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}