import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { uploadDocuments } from '../api/api';
import toast from 'react-hot-toast';
import {
  FormSection,
  FormErrorSummary,
  InlineNotice,
  TermsDialog,
} from '../components/forms/FormPrimitives';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_LABEL = 'PDF, PNG, JPEG or JPG';

function validateFile(file: File | null, required: boolean): string | undefined {
  if (!file) return required ? 'Please upload the required document.' : undefined;
  const lowerName = file.name.toLowerCase();
  const extOk = lowerName.endsWith('.pdf') || lowerName.endsWith('.png') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.jpg');
  const typeOk = ALLOWED_TYPES.includes(file.type) || (file.type === 'image/jpg' && ALLOWED_TYPES.includes('image/jpeg'));
  if (!extOk || (!typeOk && file.type)) {
    // allow if extension is ok even if mime is weird, but still check
    if (!extOk) return `Only ${ALLOWED_LABEL} files are allowed.`;
  }
  if (file.size > MAX_SIZE) return 'File must not exceed 5 MB.';
  if (file.size === 0) return 'The selected file is empty.';
  return undefined;
}

function useObjectUrl(file: File | null): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setUrl(undefined);
  }, [file]);
  return url;
}

export function DocumentUpload() {
  const [searchParams] = useSearchParams();
  const appId = parseInt(searchParams.get('appId') || '0', 10);
  const token = searchParams.get('token') || '';
  const jobTitle = useMemo(() => {
    const raw = searchParams.get('jobTitle');
    return raw ? decodeURIComponent(raw) : '';
  }, [searchParams]);

  const isValidParams = appId > 0 && token.length >= 32; // token is 36 but allow >=32 to be tolerant

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [frontError, setFrontError] = useState<string | undefined>(undefined);
  const [backError, setBackError] = useState<string | undefined>(undefined);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | undefined>(undefined);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLevelError, setFormLevelError] = useState<string | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reference, setReference] = useState<string | undefined>(undefined);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const frontUrl = useObjectUrl(idFront);
  const backUrl = useObjectUrl(idBack);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = isValidParams ? 'Submit your verification documents | Rolemino' : 'Invalid link | Rolemino';
  }, [isValidParams]);

  const handleSelect = (
    file: File | null,
    setter: (f: File | null) => void,
    setErr: (e: string | undefined) => void,
    required: boolean,
  ) => {
    if (!file) {
      setter(null);
      setErr(undefined);
      return;
    }
    const err = validateFile(file, required);
    if (err) {
      setter(null);
      setErr(err);
      toast.error(err);
      return;
    }
    setErr(undefined);
    setter(file);
    setFormLevelError(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fErr = validateFile(idFront, true);
    const bErr = validateFile(idBack, false);
    setFrontError(fErr);
    setBackError(bErr);
    if (!isPrivacyAgreed) setPrivacyError('You must accept the Document Submission Terms and Conditions.');
    else setPrivacyError(undefined);

    if (fErr || bErr || !isPrivacyAgreed) {
      const first = fErr || bErr || (!isPrivacyAgreed ? 'Please accept the terms.' : '');
      setFormLevelError(first);
      errorSummaryRef.current?.focus();
      const elId = fErr ? 'idFront-input' : bErr ? 'idBack-input' : 'privacy-checkbox';
      document.getElementById(elId)?.focus();
      return;
    }

    setFormLevelError(undefined);
    setIsSubmitting(true);
    try {
      const docs = [idFront, idBack].filter((f): f is File => f !== null);
      const fd = new FormData();
      docs.forEach((f) => fd.append('documents', f));
      const res = await uploadDocuments(appId, token, fd);
      const ref = res?.id ?? res?.applicationId ?? res?.reference ?? String(appId);
      setReference(ref ? String(ref) : undefined);
      setShowSuccess(true);
      window.scrollTo(0, 0);
      toast.success('Documents received. Rolemino will continue the qualification process.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload documents. Please try again.';
      setFormLevelError(msg);
      toast.error(msg);
      errorSummaryRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidParams) {
    return (
      <div className="pt-16 bg-canvas min-h-screen">
        <main id="main-content" className="max-w-[720px] mx-auto px-4 sm:px-6 py-10">
          <div className="bg-surface border border-default rounded-[12px] p-6 sm:p-8 text-center">
            <h1 className="text-[20px] font-semibold text-primary">Invalid or expired link</h1>
            <p className="mt-2 text-[14px] leading-[1.6] text-secondary max-w-[52ch] mx-auto">
              This document submission link is invalid or has expired. This stage is only accessible through instructions sent by Rolemino from{' '}
              <a href="mailto:careers@rolemino.com" className="text-brand underline">careers@rolemino.com</a>.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/jobs" className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse">Explore opportunities</Link>
              <a href="mailto:careers@rolemino.com" className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] border border-default bg-surface">Contact Rolemino</a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="pt-16 bg-canvas min-h-screen">
        <main id="main-content" className="max-w-[720px] mx-auto px-4 sm:px-6 py-8">
          <div className="bg-surface border border-default rounded-[12px] p-6 sm:p-8">
            <div className="w-10 h-10 rounded-full bg-success border border-success flex items-center justify-center mb-4" aria-hidden="true">
              <span className="text-success text-lg">✓</span>
            </div>
            <h1 className="text-[22px] font-semibold text-primary">Your documents have been received.</h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-secondary">Rolemino will continue the qualification process and contact you if additional information or action is required.</p>
            <p className="mt-3 text-[13px] leading-[1.6] text-secondary bg-subtle border border-default rounded-[10px] px-4 py-3">
              Document submission does not guarantee final project selection. The project owner makes the final participation decision.
            </p>
            {reference && (
              <div className="mt-5 bg-subtle border border-default rounded-[10px] px-4 py-3">
                <p className="text-[12px] font-medium text-strong-secondary">Application reference</p>
                <p className="text-[14px] font-mono font-medium text-primary break-all">{reference}</p>
              </div>
            )}
            <div className="mt-5 space-y-2 text-[13px] leading-[1.6] text-secondary">
              <p>Official contributor communication is sent through <a href="mailto:careers@rolemino.com" className="text-brand underline">careers@rolemino.com</a>.</p>
              <p>Rolemino does not request document-verification or placement fees.</p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/jobs" className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse">Explore opportunities</Link>
              <Link to="/" className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] border border-default bg-surface text-primary">Return to homepage</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const DocumentField = ({
    id,
    label,
    required,
    file,
    error,
    onSelect,
    onRemove,
    url,
  }: {
    id: string;
    label: string;
    required?: boolean;
    file: File | null;
    error?: string;
    onSelect: (f: File | null) => void;
    onRemove: () => void;
    url?: string;
  }) => (
    <div>
      <p className="block text-[13px] font-medium text-strong-secondary mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </p>
      {!file ? (
        <label
          htmlFor={id}
          className={`flex flex-col items-center justify-center w-full py-8 px-4 border-2 border-dashed rounded-[12px] cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[var(--color-focus-ring)] ${error ? 'border-danger bg-danger/5' : 'border-default bg-subtle hover:bg-surface hover:border-brand'}`}
        >
          <span className="w-10 h-10 rounded-full bg-surface border border-default flex items-center justify-center mb-2" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted">
              <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[13px] font-medium text-primary">Choose file</span>
          <span className="text-[12px] text-secondary">Drop file or click to browse</span>
          <input
            id={id}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            className="sr-only"
            aria-describedby={`${id}-help ${error ? `${id}-error` : ''}`}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onSelect(f);
              e.currentTarget.value = '';
            }}
          />
        </label>
      ) : (
        <div className="border border-default rounded-[10px] overflow-hidden bg-surface">
          {url ? (
            <img src={url} alt={`${label} preview`} className="w-full h-48 object-contain bg-subtle" />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-subtle">
              <span className="w-12 h-12 rounded-full bg-surface border border-default flex items-center justify-center" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="mt-2 text-[12px] text-secondary">PDF document</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-default">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-primary truncate" aria-live="polite">{file.name}</p>
              <p className="text-[12px] text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || 'unknown type'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor={id} className="inline-flex items-center justify-center px-3 py-1.5 min-h-[36px] rounded-[8px] border border-default bg-surface text-[12px] font-medium hover:bg-subtle cursor-pointer">
                Replace
                <input
                  id={id}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/jpg"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    onSelect(f);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
              <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="w-9 h-9 inline-flex items-center justify-center rounded-[8px] border border-default bg-surface hover:bg-danger hover:text-inverse hover:border-danger">
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      <p id={`${id}-help`} className="mt-1.5 text-[12px] leading-[1.5] text-secondary">
        Accepted formats: {ALLOWED_LABEL}. Maximum size: 5 MB per file.
      </p>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="pt-16 bg-canvas min-h-screen">
      <main id="main-content" className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-secondary">
          <span>Qualification</span> <span aria-hidden="true" className="text-muted">/</span> <span className="font-medium text-primary">Documents</span>
        </nav>

        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand flex items-center gap-2">
            <span aria-hidden="true" className="h-px w-6 bg-decorative" /> Qualification documents
          </p>
          <h1 className="mt-2 text-[26px] sm:text-[30px] font-bold tracking-tight text-primary">Submit your verification documents</h1>
          <p className="mt-2 text-[14px] leading-[1.6] text-secondary">
            {jobTitle ? (
              <>Your application for <span className="font-medium text-primary">{jobTitle}</span> has progressed to the next qualification stage. Submit the requested documents so Rolemino can complete the required verification.</>
            ) : (
              <>Your application has progressed to the next qualification stage. Submit the requested documents so Rolemino can complete the required verification.</>
            )}
          </p>
          <p className="mt-3 text-[13px] leading-[1.6] text-secondary bg-subtle border border-default rounded-[10px] px-4 py-3">
            These documents are requested only after initial application review and are used for qualification, identity or location verification as applicable.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-secondary">
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-decorative" aria-hidden="true" /> Only accessed via instructions from <a href="mailto:careers@rolemino.com" className="text-brand underline">careers@rolemino.com</a></span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-decorative" aria-hidden="true" /> No verification or placement fees</span>
          </div>
        </div>

        <div ref={errorSummaryRef} tabIndex={-1} className="outline-none">
          {formLevelError && <FormErrorSummary errors={[formLevelError]} id="doc-error-summary" />}
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          <FormSection title="Government-issued ID" description="Upload a government-issued identity document for verification.">
            <div className="grid gap-6">
              <DocumentField
                id="idFront-input"
                label="Front of ID"
                required
                file={idFront}
                error={frontError}
                onSelect={(f) => handleSelect(f, setIdFront, setFrontError, true)}
                onRemove={() => { setIdFront(null); setFrontError(undefined); }}
                url={frontUrl}
              />
              <DocumentField
                id="idBack-input"
                label="Back of ID (if applicable)"
                file={idBack}
                error={backError}
                onSelect={(f) => handleSelect(f, setIdBack, setBackError, false)}
                onRemove={() => { setIdBack(null); setBackError(undefined); }}
                url={backUrl}
              />
            </div>
            <InlineNotice>Front of ID is required. Back is optional where your document has two sides. Files are not stored in the browser and are only sent when you submit.</InlineNotice>
          </FormSection>

          <div className="bg-surface border border-default rounded-[12px] p-5">
            <label className="flex gap-3">
              <input
                id="privacy-checkbox"
                type="checkbox"
                checked={isPrivacyAgreed}
                onChange={(e) => { setIsPrivacyAgreed(e.target.checked); setPrivacyError(undefined); setFormLevelError(undefined); }}
                aria-describedby={privacyError ? 'privacy-error' : undefined}
                aria-invalid={privacyError ? true : undefined}
                className="mt-1 accent-[var(--color-action-primary)] w-4 h-4 shrink-0"
              />
              <span className="text-[13px] leading-[1.5] text-strong-secondary">
                I have read and accept the Document Submission Terms and Conditions. <span className="text-danger">*</span>
                <button type="button" onClick={() => setIsTermsOpen(true)} className="ml-1 text-brand underline hover:text-[var(--color-action-link-hover)]">View terms</button>
              </span>
            </label>
            {privacyError && <p id="privacy-error" className="mt-2 text-[12px] text-danger" role="alert">{privacyError}</p>}
            <p className="mt-3 text-[12px] leading-[1.5] text-secondary">Rolemino’s Privacy Policy and full website Terms will be published in a later legal-content phase. Official communication is sent through careers@rolemino.com.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" disabled={isSubmitting} className="min-w-[160px]">
              {isSubmitting ? 'Submitting documents…' : 'Submit documents'}
            </Button>
            <Link to="/jobs" className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-[10px] border border-default bg-surface text-[14px] font-medium text-primary hover:bg-subtle">
              Explore opportunities
            </Link>
          </div>
        </form>

        <TermsDialog open={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Document Submission Terms and Conditions">
          <h3 className="font-semibold text-primary">Rolemino Identity Verification Requirements</h3>
          <p>
            In accordance with Rolemino&apos;s Employee&apos;s Standards, and fraud and abuse prevention, you must undergo identity and location verification checks if you would like to be eligible for projects with Rolemino. The verification is completed as part of the final qualification steps before onboarding to your first project. Instructions are sent by email if you qualify. This information is retained to facilitate eligibility for other projects requiring similar verification.
          </p>
          <h3 className="font-semibold text-primary">Processing of Personal Data</h3>
          <p>
            We will need to collect, use, and retain personal data from you, or from another entity you provide your personal data to, in order to: maintain community standards, execute the project requirements; communicate with you, comply with legal obligations, and fulfill obligations to customers, vendors, or partners. This includes contact information, account and project history, demographics for relevant opportunities, payment information, and fraud detection data such as biometrics for identity verification. You agree to processing and transfer to the United States, Canada, the United Kingdom, the European Union, Australia, Philippines, and other countries for described purposes. Certain sensitive data may require your explicit consent.
          </p>
          <h3 className="font-semibold text-primary">Withdrawal of Consent and Right to Access Personal Data</h3>
          <p>If applicable law allows, you may withdraw your participation by contacting Rolemino at careers@rolemino.com. Withdrawal prevents further work on existing and new projects, while legally required information may be retained for record-keeping and fraud prevention.</p>
        </TermsDialog>
      </main>
    </div>
  );
}
