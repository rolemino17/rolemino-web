import { ReactNode, useEffect, useRef, useId } from 'react';

export function FormSection({ title, description, children, id }: { title: string; description?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="bg-surface border border-default rounded-[12px] p-5 sm:p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span aria-hidden="true" className="h-px w-6 bg-decorative shrink-0" />
          <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand">{title}</h2>
        </div>
        {description && <p className="text-[13px] leading-[1.6] text-secondary">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FormField({
  label,
  htmlFor,
  required,
  helpText,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: ReactNode;
}) {
  const helpId = helpText ? `${htmlFor}-help` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-strong-secondary mb-1.5">
        {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {helpText && (
        <p id={helpId} className="mt-1.5 text-[12px] leading-[1.5] text-secondary">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[12px] leading-[1.5] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const baseInput =
  'w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border bg-surface text-[14px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] transition-colors';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className = '', ...rest } = props;
  return (
    <input
      className={`${baseInput} ${error ? 'border-danger focus:border-danger bg-danger/5' : 'border-default hover:border-strong focus:border-brand'} ${className}`}
      aria-invalid={error ? true : undefined}
      {...rest}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  const { error, className = '', children, ...rest } = props;
  return (
    <select
      className={`${baseInput} ${error ? 'border-danger focus:border-danger bg-danger/5' : 'border-default hover:border-strong focus:border-brand'} ${className}`}
      aria-invalid={error ? true : undefined}
      {...rest}
    >
      {children}
    </select>
  );
}

export function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  const { error, className = '', ...rest } = props;
  return (
    <textarea
      className={`${baseInput} min-h-[88px] py-2.5 ${error ? 'border-danger focus:border-danger bg-danger/5' : 'border-default hover:border-strong focus:border-brand'} ${className}`}
      aria-invalid={error ? true : undefined}
      {...rest}
    />
  );
}

export function FormErrorSummary({ errors, id }: { errors: string[]; id?: string }) {
  if (errors.length === 0) return null;
  return (
    <div
      id={id}
      role="alert"
      aria-labelledby={`${id}-title`}
      className="bg-danger border border-danger rounded-[10px] p-4"
    >
      <h3 id={`${id}-title`} className="text-[13px] font-semibold text-danger">
        Please correct the following
      </h3>
      <ul className="mt-2 list-disc pl-5 space-y-1">
        {errors.map((e, i) => (
          <li key={i} className="text-[13px] leading-[1.5] text-danger">
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressSteps({
  steps,
  current,
  onStepClick,
}: {
  steps: string[];
  current: number;
  onStepClick?: (idx: number) => void;
}) {
  return (
    <nav aria-label="Application progress" className="bg-surface border border-default rounded-[12px] p-4">
      <ol className="flex flex-wrap gap-2 sm:gap-0 sm:grid sm:grid-cols-5">
        {steps.map((label, idx) => {
          const isActive = idx === current;
          const isCompleted = idx < current;
          const isClickable = isCompleted && onStepClick;
          return (
            <li key={label} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[120px] sm:min-w-0">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(idx)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-2 text-left group ${isClickable ? 'cursor-pointer' : 'cursor-default'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm`}
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold border transition-colors ${
                    isActive
                      ? 'bg-brand text-inverse border-brand ring-4 ring-brand-subtle'
                      : isCompleted
                        ? 'bg-success text-success border-success'
                        : 'bg-subtle text-secondary border-default'
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
                <span
                  className={`text-[12px] sm:text-[13px] leading-tight ${isActive ? 'font-semibold text-primary' : isCompleted ? 'font-medium text-strong-secondary group-hover:text-primary' : 'text-secondary'}`}
                >
                  {label}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <span aria-hidden="true" className={`hidden sm:block flex-1 h-px mx-2 ${isCompleted ? 'bg-success' : 'bg-default'}`} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
    </nav>
  );
}

export function InlineNotice({ tone = 'info', children }: { tone?: 'info' | 'warning' | 'success'; children: ReactNode }) {
  const map = {
    info: 'bg-info border-info text-info',
    warning: 'bg-warning border-warning text-warning',
    success: 'bg-success border-success text-success',
  } as const;
  return <div className={`border rounded-[10px] px-4 py-3 text-[13px] leading-[1.6] ${map[tone]}`}>{children}</div>;
}

export function TermsDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      // focus close button or dialog
      setTimeout(() => closeRef.current?.focus(), 0);
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      // prevent body scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = prev;
      };
    } else {
      previousFocus.current?.focus();
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[var(--color-overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="bg-surface rounded-[12px] border border-default w-full max-w-2xl max-h-[85vh] flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-subtle flex items-start justify-between gap-4">
          <h2 id={`${id}-title`} className="text-[16px] font-semibold text-primary">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-[10px] border border-default bg-surface hover:bg-subtle text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto text-[13px] leading-[1.7] text-secondary space-y-4">{children}</div>
        <div className="px-6 py-4 border-t border-subtle flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[14px] font-medium hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            Close
          </button>
        </div>
      </div>
      {/* backdrop click */}
      <button
        aria-label="Close dialog backdrop"
        onClick={onClose}
        className="absolute inset-0 -z-10"
        tabIndex={-1}
      />
    </div>
  );
}

export function FileUploadField({
  id,
  label,
  helpText,
  error,
  file,
  onSelect,
  onRemove,
  accept,
  required,
}: {
  id: string;
  label: string;
  helpText?: string;
  error?: string;
  file: File | null;
  onSelect: (f: File | null) => void;
  onRemove: () => void;
  accept: string;
  required?: boolean;
}) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label className="block text-[13px] font-medium text-strong-secondary mb-1.5">
        {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
      </label>
      {!file ? (
        <label
          htmlFor={id}
          className={`flex flex-col items-center justify-center w-full py-6 px-4 border-2 border-dashed rounded-[12px] cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[var(--color-focus-ring)] focus-within:border-brand ${error ? 'border-danger bg-danger/5 hover:border-danger' : 'border-default bg-subtle hover:bg-surface hover:border-brand'}`}
        >
          <span className="w-10 h-10 rounded-full bg-surface border border-default flex items-center justify-center mb-2" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[13px] font-medium text-primary">Choose file</span>
          <span className="text-[12px] text-secondary">or drag and drop</span>
          <input id={id} type="file" accept={accept} className="sr-only" aria-describedby={describedBy} aria-invalid={error ? true : undefined} onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onSelect(f);
            // reset value to allow reselection of same file
            if (e.target) e.target.value = '';
          }} />
        </label>
      ) : (
        <div className="flex items-center justify-between gap-3 w-full px-4 py-3 border border-default rounded-[10px] bg-surface">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-primary truncate">{file.name}</p>
            <p className="text-[12px] text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor={id} className="inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] rounded-[8px] border border-default bg-surface text-[12px] font-medium text-primary hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] cursor-pointer">
              Replace
              <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                onSelect(f);
                if (e.target) e.target.value = '';
              }} />
            </label>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-[8px] border border-default bg-surface hover:bg-danger hover:text-inverse hover:border-danger text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {helpText && (
        <p id={helpId} className="mt-1.5 text-[12px] leading-[1.5] text-secondary">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[12px] leading-[1.5] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
