import { useEffect, useRef } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'info';
  autoCloseDuration?: number; // in milliseconds
}

export function FeedbackModal({ isOpen, onClose, message, type = 'info', autoCloseDuration }: FeedbackModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-close after specified duration
  useEffect(() => {
    if (isOpen && autoCloseDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamic styling based on type — semantic functional tokens
  const typeStyles = {
    success: 'bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success-text)]',
    error: 'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)] text-[var(--color-danger-text)]',
    info: 'bg-[var(--color-info-bg)] border-[var(--color-info-border)] text-[var(--color-info-text)]',
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-overlay)] backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`w-full max-w-md p-6 rounded-lg shadow-lg border-l-4 bg-surface ${typeStyles[type]} animate-slideIn focus:outline-none`}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="feedback-modal-title"
      >
        <h2 id="feedback-modal-title" className="text-lg font-semibold mb-4">
          {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information'}
        </h2>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

// CSS animation for slide-in effect
const styles = `
@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
