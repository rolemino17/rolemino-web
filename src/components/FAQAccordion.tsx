import { useState } from 'react';

export type FAQItem = { q: string; a: string };

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-default">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        const panelId = `faq-panel-${idx}`;
        const buttonId = `faq-button-${idx}`;
        return (
          <div key={idx} className="border-b border-default">
            <h3>
              <button
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-sm group"
              >
                <span className={`text-[15px] sm:text-[16px] font-medium leading-snug ${isOpen ? 'text-primary' : 'text-primary group-hover:text-brand'} transition-colors`}>
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isOpen ? 'bg-brand text-inverse border-brand' : 'bg-surface text-secondary border-default group-hover:border-strong group-hover:text-primary'}`}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d={isOpen ? 'M3 8h10' : 'M8 3v10M3 8h10'}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={`${isOpen ? 'block' : 'hidden'} pb-5`}
            >
              <p className="text-[14px] sm:text-[15px] leading-[1.7] text-secondary max-w-[68ch] pr-4">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
