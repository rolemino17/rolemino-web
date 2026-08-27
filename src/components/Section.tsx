import { ReactNode } from 'react';

type SectionProps = {
  id?: string;
  children: ReactNode;
  variant?: 'canvas' | 'surface' | 'subtle' | 'inverse';
  className?: string;
  innerClassName?: string;
  /** prevent default vertical padding if needed */
  noPadding?: boolean;
};

const variantMap: Record<string, string> = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
  subtle: 'bg-subtle',
  inverse: 'bg-inverse text-inverse',
};

export function Section({ id, children, variant = 'canvas', className = '', innerClassName = '', noPadding = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`${variantMap[variant]} ${noPadding ? '' : 'py-14 sm:py-16 lg:py-20'} ${className} scroll-mt-[68px]`}
    >
      <div className={`max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 ${innerClassName}`}>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'inverse' | 'accent' }) {
  const cls =
    variant === 'inverse'
      ? 'text-inverse-secondary'
      : variant === 'accent'
        ? 'text-accent'
        : 'text-brand';
  return (
    <p className={`text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase ${cls} flex items-center gap-2`}>
      <span aria-hidden="true" className={`inline-block h-px w-6 ${variant === 'inverse' ? 'bg-[var(--color-brand-200)]' : 'bg-decorative'} shrink-0`} />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  eyebrowVariant = 'default',
  titleId,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  eyebrowVariant?: 'default' | 'inverse' | 'accent';
  titleId?: string;
}) {
  const isCenter = align === 'center';
  return (
    <div className={`${isCenter ? 'text-center mx-auto max-w-[640px]' : 'max-w-[720px]'} mb-8 sm:mb-10`}>
      {eyebrow && <Eyebrow variant={eyebrowVariant}>{eyebrow}</Eyebrow>}
      <h2
        id={titleId}
        className={`mt-3 font-semibold tracking-tight text-primary ${isCenter ? 'text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.15]' : 'text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.15]'}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-[15px] sm:text-[16px] leading-[1.6] text-secondary ${isCenter ? '' : 'max-w-[62ch]'}`}>{description}</p>
      )}
    </div>
  );
}
