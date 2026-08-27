import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Application, ResidentialAddress } from '../types';
import { countries } from '../data/CountryList';
import { getJob, submitApplication } from '../api/api';
import { customList } from 'country-codes-list';
import toast from 'react-hot-toast';
import { saveDraft, loadDraft, clearDraft } from '../utils/applicationDraft';
import {
  FormSection,
  FormField,
  TextInput,
  SelectInput,
  TextareaInput,
  FormErrorSummary,
  ProgressSteps,
  InlineNotice,
  TermsDialog,
  FileUploadField,
} from '../components/forms/FormPrimitives';

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const STEPS = ['Personal information', 'Location and eligibility', 'Experience and qualifications', 'Availability and resume', 'Review and consent'] as const;

type StepErrors = Record<string, string>;
type FormState = Omit<Partial<Application>, 'availableHours'> & { availableHours?: number | string };

function validateStep(step: number, data: FormState, resumeFile: File | null): StepErrors {
  const errs: StepErrors = {};
  const addr = data.residentialAddress as ResidentialAddress | undefined;
  if (step === 0) {
    if (!data.firstName?.trim()) errs.firstName = 'Enter your first name.';
    if (!data.lastName?.trim()) errs.lastName = 'Enter your last name.';
    if (!data.email?.trim()) errs.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errs.email = 'Enter a valid email address.';
    if (!data.phone?.trim()) errs.phone = 'Enter your phone number.';
    if (!data.phoneCountryCode?.trim()) errs.phoneCountryCode = 'Select a country code.';
  }
  if (step === 1) {
    if (!addr?.streetName?.trim()) errs.streetName = 'Enter your street address.';
    if (!addr?.city?.trim()) errs.city = 'Enter your city.';
    if (!addr?.state?.trim()) errs.state = 'Enter your state or province.';
    if (!addr?.postalCode?.trim()) errs.postalCode = 'Enter your postal code.';
    if (!addr?.country?.trim()) errs.country = 'Select your country of residence.';
    if (!data.countryOfBirth?.trim()) errs.countryOfBirth = 'Select your country of birth.';
  }
  if (step === 2) {
    if (!data.highestEducationLevel?.trim()) errs.highestEducationLevel = 'Select your highest education level.';
    if (!data.primarySpokenLanguage?.trim()) errs.primarySpokenLanguage = 'Enter your primary spoken language.';
  }
  if (step === 3) {
    if (data.availableHours === undefined || data.availableHours === '' || data.availableHours === null) {
      errs.availableHours = 'Enter your available hours per week.';
    } else if (Number(data.availableHours) < 1 || Number(data.availableHours) > 168) {
      errs.availableHours = 'Enter a value between 1 and 168.';
    }
    if (!resumeFile) errs.resume = 'Upload your resume as a PDF.';
    else if (resumeFile.type !== 'application/pdf') errs.resume = 'Resume must be a PDF file.';
    else if (resumeFile.size > MAX_RESUME_SIZE) errs.resume = 'Resume must not exceed 5 MB.';
  }
  if (step === 4) {
    // aggregate all previous plus consent
    const all = { ...validateStep(0, data, resumeFile), ...validateStep(1, data, resumeFile), ...validateStep(2, data, resumeFile), ...validateStep(3, data, resumeFile) };
    Object.assign(errs, all);
    if (!data.dataAgreement) errs.dataAgreement = 'You must accept the Application Terms and Conditions to submit.';
  }
  return errs;
}

export function JobApplication() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ? parseInt(id, 10) : NaN;
  const opportunityId = id ?? '';

  const [formData, setFormData] = useState<FormState>({
    jobId: isNaN(jobId) ? undefined : jobId,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '+1',
    resumeUrl: '',
    residentialAddress: { streetName: '', city: '', state: '', postalCode: '', country: '' },
    countryOfBirth: '',
    highestEducationLevel: '',
    primarySpokenLanguage: '',
    additionalLanguage: '',
    availableHours: undefined as unknown as number,
    additionalInformation: '',
    dataAgreement: false,
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [formLevelError, setFormLevelError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const draftKey = opportunityId;

  // Load draft on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!opportunityId || isNaN(jobId)) return;
    const draft = loadDraft(opportunityId);
    if (draft) {
      setFormData((prev) => ({
        ...prev,
        ...draft,
        residentialAddress: {
          streetName: draft.residentialAddress?.streetName ?? prev.residentialAddress?.streetName ?? '',
          city: draft.residentialAddress?.city ?? prev.residentialAddress?.city ?? '',
          state: draft.residentialAddress?.state ?? prev.residentialAddress?.state ?? '',
          postalCode: draft.residentialAddress?.postalCode ?? prev.residentialAddress?.postalCode ?? '',
          country: draft.residentialAddress?.country ?? prev.residentialAddress?.country ?? '',
        },
        jobId: isNaN(jobId) ? undefined : jobId,
        // never restore terms
        dataAgreement: false,
      }));
      if (draft._resumeReminder) {
        toast('A previously selected resume was not saved. Please select your PDF again.', { icon: 'ℹ️' });
      }
    }
  }, [opportunityId, jobId]);

  // Persist draft on change (exclude file/terms)
  useEffect(() => {
    if (!opportunityId || isNaN(jobId) || showSuccess) return;
    const payload: Record<string, unknown> = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      phoneCountryCode: formData.phoneCountryCode,
      residentialAddress: formData.residentialAddress,
      countryOfBirth: formData.countryOfBirth,
      highestEducationLevel: formData.highestEducationLevel,
      primarySpokenLanguage: formData.primarySpokenLanguage,
      additionalLanguage: formData.additionalLanguage,
      availableHours: formData.availableHours,
      additionalInformation: formData.additionalInformation,
      _resumeReminder: resumeFile ? true : undefined,
    };
    saveDraft(opportunityId, payload);
  }, [
    formData.firstName,
    formData.middleName,
    formData.lastName,
    formData.email,
    formData.phone,
    formData.phoneCountryCode,
    formData.residentialAddress,
    formData.countryOfBirth,
    formData.highestEducationLevel,
    formData.primarySpokenLanguage,
    formData.additionalLanguage,
    formData.availableHours,
    formData.additionalInformation,
    resumeFile,
    opportunityId,
    jobId,
    showSuccess,
  ]);

  const { data: job, isLoading: jobLoading, isError: jobError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id!),
    enabled: !!id && !isNaN(jobId),
    retry: false,
  });

  useEffect(() => {
    if (job) document.title = `Apply for ${job.title} | Rolemino`;
    else document.title = 'Apply | Rolemino';
  }, [job]);

  const submitMutation = useMutation({
    mutationFn: async (data: FormState) => {
      if (!resumeFile) throw new Error('Please upload a resume.');
      if (resumeFile.type !== 'application/pdf') throw new Error('Resume must be a PDF file.');
      if (resumeFile.size > MAX_RESUME_SIZE) throw new Error('Resume file must not exceed 5 MB.');
      const formDataToSend = new FormData();
      const jsonData = {
        jobId: data.jobId,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        phoneCountryCode: data.phoneCountryCode,
        residentialAddress: data.residentialAddress,
        countryOfBirth: data.countryOfBirth,
        highestEducationLevel: data.highestEducationLevel,
        primarySpokenLanguage: data.primarySpokenLanguage,
        additionalLanguage: data.additionalLanguage,
        availableHours: data.availableHours,
        additionalInformation: data.additionalInformation,
        dataAgreement: data.dataAgreement,
      };
      formDataToSend.append('applicationData', JSON.stringify(jsonData));
      formDataToSend.append('resume', resumeFile);
      const response = await submitApplication(formDataToSend);
      return response;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setIsSubmitting(false);
      clearDraft(draftKey);
      window.scrollTo(0, 0);
      toast.success('Application submitted successfully.');
    },
    onError: (error: unknown) => {
      setIsSubmitting(false);
      const msg = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      setFormLevelError(msg);
      toast.error(msg);
      errorSummaryRef.current?.focus();
    },
  });

  const countryCodes = useMemo(() => {
    type Entry = { country: string; code: string; isoCode: string };
    return (Object.values(customList('countryCode', '{countryNameEn}|{countryCallingCode}|{countryCode}') as unknown as string[]) as string[])
      .map((entry: string) => {
        const [country, callingCode, isoCode] = entry.split('|');
        return { country, code: `+${callingCode}`, isoCode };
      })
      .filter((e: Entry) => e.code !== '+undefined');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | number | boolean = value;
    if (type === 'checkbox' && 'checked' in e.target) fieldValue = (e.target as HTMLInputElement).checked;
    else if (name === 'availableHours') fieldValue = value ? parseInt(value, 10) : ('' as unknown as number);
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      residentialAddress: { ...(prev.residentialAddress as ResidentialAddress), [name]: value },
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleResumeSelect = (file: File | null) => {
    if (!file) {
      setResumeFile(null);
      setResumeError(undefined);
      return;
    }
    if (file.type !== 'application/pdf') {
      setResumeError('Resume must be a PDF file.');
      setResumeFile(null);
      toast.error('Resume must be a PDF file.');
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      setResumeError('Resume must not exceed 5 MB.');
      setResumeFile(null);
      toast.error('Resume file must not exceed 5 MB.');
      return;
    }
    setResumeError(undefined);
    setResumeFile(file);
  };

  const focusFirstError = (errs: StepErrors) => {
    const firstKey = Object.keys(errs).find((k) => errs[k]);
    if (!firstKey) return;
    const el = document.getElementById(firstKey) || document.getElementById(`resume-input`);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      errorSummaryRef.current?.focus();
    }
  };

  const handleNext = () => {
    const stepErrs = validateStep(currentStep, formData, resumeFile);
    // resume error separate
    if (stepErrs.resume) setResumeError(stepErrs.resume);
    const hasErr = Object.values(stepErrs).some(Boolean);
    if (hasErr) {
      setErrors(stepErrs);
      setFormLevelError(undefined);
      const list = Object.values(stepErrs).filter(Boolean);
      if (list.length) {
        setFormLevelError(list[0]);
        errorSummaryRef.current?.focus();
      }
      focusFirstError(stepErrs);
      return;
    }
    setErrors({});
    setFormLevelError(undefined);
    setResumeError(undefined);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setErrors({});
    setFormLevelError(undefined);
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleStepClick = (idx: number) => {
    if (idx < currentStep) {
      setCurrentStep(idx);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allErrs = validateStep(4, formData, resumeFile);
    if (allErrs.resume) setResumeError(allErrs.resume);
    const hasErr = Object.values(allErrs).some(Boolean);
    if (hasErr) {
      setErrors(allErrs);
      const list = Object.values(allErrs).filter(Boolean);
      setFormLevelError(list.join(' '));
      focusFirstError(allErrs);
      return;
    }
    if (!formData.dataAgreement) {
      toast.error('Please accept the Application Terms and Conditions before submitting.');
      return;
    }
    setErrors({});
    setFormLevelError(undefined);
    setIsSubmitting(true);
    submitMutation.mutate(formData);
  };

  const handleClearDraft = () => {
    if (confirm('Clear the saved application draft for this opportunity? This cannot be undone.')) {
      clearDraft(draftKey);
      setFormData((prev) => ({
        ...prev,
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        phoneCountryCode: '+1',
        residentialAddress: { streetName: '', city: '', state: '', postalCode: '', country: '' },
        countryOfBirth: '',
        highestEducationLevel: '',
        primarySpokenLanguage: '',
        additionalLanguage: '',
        availableHours: undefined as unknown as number,
        additionalInformation: '',
        dataAgreement: false,
      }));
      setResumeFile(null);
      setResumeError(undefined);
      toast.success('Saved draft cleared.');
    }
  };

  if (isNaN(jobId)) {
    return (
      <div className="pt-16 bg-canvas min-h-screen">
        <main id="main-content" className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-[24px] font-bold text-primary">Invalid opportunity</h1>
          <p className="mt-2 text-[14px] text-secondary">The opportunity identifier is invalid. Please check the URL.</p>
          <Link to="/jobs" className="mt-6 inline-flex px-5 py-2.5 rounded-[10px] bg-[var(--color-action-primary)] text-inverse">Explore opportunities</Link>
        </main>
      </div>
    );
  }

  if (jobLoading) {
    return (
      <div className="pt-16 bg-canvas min-h-screen">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
          <div className="h-6 w-40 bg-muted rounded animate-pulse mb-6" />
          <div className="h-64 bg-surface border border-default rounded-[12px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="pt-16 bg-canvas min-h-screen">
        <main id="main-content" className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-secondary">
            <Link to="/jobs" className="hover:text-primary">Opportunities</Link> <span aria-hidden="true">/</span> <span className="text-primary">Apply</span>
          </nav>
          <div className="bg-surface border border-default rounded-[12px] p-8 text-center">
            <h1 className="text-[20px] font-semibold text-primary">This opportunity is no longer accepting applications.</h1>
            <p className="mt-2 text-[14px] text-secondary">Explore current opportunities to find other projects suited to your experience.</p>
            <Link to="/jobs" className="mt-6 inline-flex px-6 py-3 rounded-[10px] bg-[var(--color-action-primary)] text-inverse">Explore current opportunities</Link>
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
            <h1 className="text-[22px] font-semibold text-primary">Your application has been received.</h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-secondary">
              Rolemino will review your information against the opportunity requirements. If your application qualifies for the next stage, Rolemino will contact you by email.
            </p>
            <div className="mt-5 space-y-3 text-[13px] leading-[1.6] text-secondary">
              <p>Official contributor communication is sent through <a href="mailto:careers@rolemino.com" className="text-brand underline">careers@rolemino.com</a>.</p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/jobs" className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] bg-[var(--color-action-primary)] text-inverse text-[14px] font-medium">Explore other opportunities</Link>
              <Link to="/" className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-[10px] border border-default bg-surface text-primary text-[14px] font-medium">Return to homepage</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-canvas min-h-screen">
      <main id="main-content" className="max-w-[800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-secondary">
            <li><Link to="/jobs" className="hover:text-primary focus-visible:outline-2">Opportunities</Link></li>
            <li aria-hidden="true" className="text-muted">/</li>
            <li><Link to={`/jobs/${job.id}`} className="hover:text-primary max-w-[20ch] truncate inline-block align-bottom">{job.title}</Link></li>
            <li aria-hidden="true" className="text-muted">/</li>
            <li aria-current="page" className="font-medium text-primary">Apply</li>
          </ol>
        </nav>

        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-brand flex items-center gap-2">
            <span aria-hidden="true" className="h-px w-6 bg-decorative" /> Opportunity application
          </p>
          <h1 className="mt-2 text-[26px] sm:text-[30px] font-bold tracking-tight text-primary">Apply for {job.title}</h1>
          <p className="mt-2 text-[14px] leading-[1.6] text-secondary">Tell us about your experience, qualifications and availability. Rolemino will review your application against the opportunity requirements.</p>
        </div>

        <div className="mb-6">
          <ProgressSteps steps={[...STEPS]} current={currentStep} onStepClick={handleStepClick} />
        </div>

        <div ref={errorSummaryRef} tabIndex={-1} className="outline-none">
          {formLevelError && <div className="mt-4"><FormErrorSummary errors={[formLevelError]} id="form-error-summary" /></div>}
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6" onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && currentStep !== 4) e.preventDefault(); }}>
          {currentStep === 0 && (
            <FormSection title="Personal information" description="How Rolemino can contact you about this opportunity.">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="First name" htmlFor="firstName" required error={errors.firstName}>
                  <TextInput id="firstName" name="firstName" value={formData.firstName ?? ''} onChange={handleChange} autoComplete="given-name" aria-describedby={errors.firstName ? 'firstName-error' : undefined} error={!!errors.firstName} required />
                </FormField>
                <FormField label="Middle name" htmlFor="middleName">
                  <TextInput id="middleName" name="middleName" value={formData.middleName ?? ''} onChange={handleChange} autoComplete="additional-name" />
                </FormField>
                <FormField label="Last name" htmlFor="lastName" required error={errors.lastName}>
                  <TextInput id="lastName" name="lastName" value={formData.lastName ?? ''} onChange={handleChange} autoComplete="family-name" error={!!errors.lastName} required />
                </FormField>
                <FormField label="Email" htmlFor="email" required error={errors.email}>
                  <TextInput id="email" name="email" type="email" value={formData.email ?? ''} onChange={handleChange} autoComplete="email" inputMode="email" error={!!errors.email} required />
                </FormField>
                <FormField label="Phone country code" htmlFor="phoneCountryCode" required error={errors.phoneCountryCode}>
                  <SelectInput id="phoneCountryCode" name="phoneCountryCode" value={formData.phoneCountryCode ?? ''} onChange={handleChange} error={!!errors.phoneCountryCode} required>
                    {countryCodes.map(({ country, code, isoCode }) => (
                      <option key={isoCode} value={code}>{code} ({country})</option>
                    ))}
                  </SelectInput>
                </FormField>
                <FormField label="Phone" htmlFor="phone" required error={errors.phone} helpText="Numbers only, without country code.">
                  <TextInput id="phone" name="phone" type="tel" value={formData.phone ?? ''} onChange={handleChange} autoComplete="tel" inputMode="numeric" maxLength={11} error={!!errors.phone} required />
                </FormField>
              </div>
            </FormSection>
          )}

          {currentStep === 1 && (
            <FormSection title="Location and eligibility" description="Current residence and eligibility information for this opportunity.">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Street address" htmlFor="streetName" required error={errors.streetName}>
                  <TextInput id="streetName" name="streetName" value={formData.residentialAddress?.streetName ?? ''} onChange={handleAddressChange} autoComplete="street-address" error={!!errors.streetName} required />
                </FormField>
                <FormField label="City" htmlFor="city" required error={errors.city}>
                  <TextInput id="city" name="city" value={formData.residentialAddress?.city ?? ''} onChange={handleAddressChange} autoComplete="address-level2" error={!!errors.city} required />
                </FormField>
                <FormField label="State / Province" htmlFor="state" required error={errors.state}>
                  <TextInput id="state" name="state" value={formData.residentialAddress?.state ?? ''} onChange={handleAddressChange} autoComplete="address-level1" error={!!errors.state} required />
                </FormField>
                <FormField label="Postal code" htmlFor="postalCode" required error={errors.postalCode}>
                  <TextInput id="postalCode" name="postalCode" value={formData.residentialAddress?.postalCode ?? ''} onChange={handleAddressChange} autoComplete="postal-code" maxLength={6} error={!!errors.postalCode} required />
                </FormField>
                <FormField label="Country of residence" htmlFor="country" required error={errors.country}>
                  <SelectInput id="country" name="country" value={formData.residentialAddress?.country ?? ''} onChange={handleAddressChange} error={!!errors.country} required>
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </SelectInput>
                </FormField>
                <FormField label="Country of birth" htmlFor="countryOfBirth" required error={errors.countryOfBirth} >
                  <SelectInput id="countryOfBirth" name="countryOfBirth" value={formData.countryOfBirth ?? ''} onChange={handleChange} error={!!errors.countryOfBirth} required>
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </SelectInput>
                </FormField>
              </div>
              <InlineNotice tone="info">Project location eligibility varies by opportunity. “Remote” does not guarantee global eligibility.</InlineNotice>
            </FormSection>
          )}

          {currentStep === 2 && (
            <FormSection title="Experience and qualifications" description="Help Rolemino assess your fit for this project.">
              <FormField label="Highest education level" htmlFor="highestEducationLevel" required error={errors.highestEducationLevel}>
                <SelectInput id="highestEducationLevel" name="highestEducationLevel" value={formData.highestEducationLevel ?? ''} onChange={handleChange} error={!!errors.highestEducationLevel} required>
                  <option value="" disabled>Select education level</option>
                  <option value="Primary education (elementary school)">Primary education (elementary school)</option>
                  <option value="Some secondary education (high school)">Some secondary education (high school)</option>
                  <option value="Secondary education completed (high school diploma or equivalent)">Secondary education completed (high school diploma or equivalent)</option>
                  <option value="Vocational/technical training or certification (eg. Trade school)">Vocational/technical training or certification (eg. Trade school)</option>
                  <option value="Some college or university (no degree)">Some college or university (no degree)</option>
                  <option value="Associate's degree (eg AA, AS)">Associate's degree (eg AA, AS)</option>
                  <option value="Bachelor's degree (eg. BA, BS)">Bachelor's degree (eg. BA, BS)</option>
                  <option value="Post Graduate diploma or certificate (non degree)">Post Graduate diploma or certificate (non degree)</option>
                  <option value="Master's degree (eg. MA, MS, MBA, MFA)">Master's degree (eg. MA, MS, MBA, MFA)</option>
                  <option value="Doctoral or professional degree (eg. PhD, MD, JD)">Doctoral or professional degree (eg. PhD, MD, JD)</option>
                  <option value="No Formal education">No Formal education</option>
                </SelectInput>
              </FormField>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Primary spoken language" htmlFor="primarySpokenLanguage" required error={errors.primarySpokenLanguage}>
                  <TextInput id="primarySpokenLanguage" name="primarySpokenLanguage" value={formData.primarySpokenLanguage ?? ''} onChange={handleChange} error={!!errors.primarySpokenLanguage} required />
                </FormField>
                <FormField label="Additional language" htmlFor="additionalLanguage" helpText="Optional. Separate multiple languages with commas.">
                  <TextInput id="additionalLanguage" name="additionalLanguage" value={formData.additionalLanguage ?? ''} onChange={handleChange} />
                </FormField>
              </div>
              <FormField label="Additional information" htmlFor="additionalInformation" helpText="Include a brief cover note or relevant experience for this opportunity.">
                <TextareaInput id="additionalInformation" name="additionalInformation" value={formData.additionalInformation ?? ''} onChange={handleChange} placeholder="Relevant skills, project experience, or availability notes…" rows={4} />
              </FormField>
            </FormSection>
          )}

          {currentStep === 3 && (
            <FormSection title="Availability and resume" description="Your availability and a current resume help Rolemino evaluate your application.">
              <FormField label="Available hours per week" htmlFor="availableHours" required error={errors.availableHours}>
                <TextInput id="availableHours" name="availableHours" type="number" inputMode="numeric" min={1} max={168} value={formData.availableHours ?? ''} onChange={handleChange} error={!!errors.availableHours} required />
              </FormField>
              <FileUploadField
                id="resume-input"
                label="Resume"
                required
                helpText="Upload your resume as a PDF. Maximum file size: 5MB."
                error={resumeError || errors.resume}
                file={resumeFile}
                onSelect={handleResumeSelect}
                onRemove={() => { setResumeFile(null); setResumeError(undefined); }}
                accept="application/pdf"
              />
            </FormSection>
          )}

          {currentStep === 4 && (
            <>
              <FormSection title="Review your application" description="Check your information before submitting. You can return to any step to make corrections.">
                <div className="space-y-4 text-[13px] leading-[1.6]">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-subtle border border-default rounded-[10px] p-4">
                      <h3 className="text-[13px] font-semibold text-primary">Personal information</h3>
                      <p className="text-secondary">{formData.firstName} {formData.middleName} {formData.lastName}</p>
                      <p className="text-secondary">{formData.email}</p>
                      <p className="text-secondary">{formData.phoneCountryCode} {formData.phone}</p>
                      <button type="button" onClick={() => setCurrentStep(0)} className="mt-2 text-brand underline text-[12px]">Edit</button>
                    </div>
                    <div className="bg-subtle border border-default rounded-[10px] p-4">
                      <h3 className="text-[13px] font-semibold text-primary">Location</h3>
                      <p className="text-secondary">{formData.residentialAddress?.streetName}, {formData.residentialAddress?.city}, {formData.residentialAddress?.state} {formData.residentialAddress?.postalCode}</p>
                      <p className="text-secondary">{formData.residentialAddress?.country} · Born in {formData.countryOfBirth}</p>
                      <button type="button" onClick={() => setCurrentStep(1)} className="mt-2 text-brand underline text-[12px]">Edit</button>
                    </div>
                    <div className="bg-subtle border border-default rounded-[10px] p-4">
                      <h3 className="text-[13px] font-semibold text-primary">Experience</h3>
                      <p className="text-secondary">{formData.highestEducationLevel}</p>
                      <p className="text-secondary">Primary: {formData.primarySpokenLanguage} {formData.additionalLanguage ? `· Additional: ${formData.additionalLanguage}` : ''}</p>
                      <button type="button" onClick={() => setCurrentStep(2)} className="mt-2 text-brand underline text-[12px]">Edit</button>
                    </div>
                    <div className="bg-subtle border border-default rounded-[10px] p-4">
                      <h3 className="text-[13px] font-semibold text-primary">Availability and resume</h3>
                      <p className="text-secondary">{formData.availableHours} hours per week</p>
                      <p className="text-secondary truncate">{resumeFile ? resumeFile.name : 'No resume selected'}</p>
                      <p className="text-secondary line-clamp-2">{formData.additionalInformation || '—'}</p>
                      <button type="button" onClick={() => setCurrentStep(3)} className="mt-2 text-brand underline text-[12px]">Edit</button>
                    </div>
                  </div>
                </div>
              </FormSection>

              <div className="bg-surface border border-default rounded-[12px] p-5">
                <label className="flex gap-3">
                  <input
                    id="dataAgreement"
                    name="dataAgreement"
                    type="checkbox"
                    checked={!!formData.dataAgreement}
                    onChange={handleChange}
                    aria-describedby={errors.dataAgreement ? 'dataAgreement-error' : undefined}
                    aria-invalid={errors.dataAgreement ? true : undefined}
                    className="mt-1 accent-[var(--color-action-primary)] w-4 h-4 shrink-0"
                    required
                  />
                  <span className="text-[13px] leading-[1.5] text-strong-secondary">
                    I have read and accept the Application Terms and Conditions. <span className="text-danger">*</span>
                    <button type="button" onClick={() => setIsTermsOpen(true)} className="ml-1 text-brand underline hover:text-[var(--color-action-link-hover)]">View terms</button>
                  </span>
                </label>
                {errors.dataAgreement && <p id="dataAgreement-error" className="mt-2 text-[12px] text-danger" role="alert">{errors.dataAgreement}</p>}
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button type="button" variant="secondary" onClick={handleBack} className="min-w-[100px]">
                  Back
                </Button>
              )}
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[13px] text-secondary hover:text-primary underline underline-offset-4 focus-visible:outline-2"
              >
                Clear saved application
              </button>
            </div>
            {currentStep < 4 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="min-w-[140px]">
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={isSubmitting} className="min-w-[160px]">
                {isSubmitting ? 'Submitting application…' : 'Submit application'}
              </Button>
            )}
          </div>
        </form>

        <TermsDialog open={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Application Terms and Conditions">
          <h3 className="font-semibold text-primary">Rolemino Identity Verification Requirements</h3>
          <p>
            In accordance with Rolemino&apos;s Employee&apos;s Standards, and fraud and abuse prevention, you must undergo identity and location verification checks if you would like to be eligible for projects with Rolemino. The identity and location verification process will be completed as a part of the final steps in qualification before you can be onboarded to your first project with Rolemino. If you are successful in the other steps of qualification, you will be provided with the necessary instructions to complete the identity and location verification via email. This information will be retained so that you can more easily be eligible for other projects that require similar identification verifications.
          </p>
          <h3 className="font-semibold text-primary">Processing of Personal Data</h3>
          <p>
            We will need to collect, use, and retain personal data from you, or from another entity you provide your personal data to, in order to: maintain community standards, execute the project requirements; communicate with you, comply with our legal obligations as required by law; and fulfill any other obligations we may have to our customers, vendors, or partners. Examples include your contact information, account information and what projects you worked on for record-keeping, demographics for relevant project opportunities, payment information, and fraud detection/prevention such as biometrics for identity verification. You acknowledge that your personal data may be transferred to the United States, Canada, the United Kingdom, the European Union, Australia, Philippines, and other countries for the described purposes. Certain special categories or “sensitive” personal data may require your consent before processing.
          </p>
          <h3 className="font-semibold text-primary">Withdrawal of Consent and Right to Access Personal Data</h3>
          <p>
            If applicable law allows, you may withdraw your participation by contacting Rolemino at careers@rolemino.com. Withdrawal will prevent further work on existing projects and participation in new projects. After withdrawal, Rolemino and its affiliates may retain information as legally required, such as account information and fraud prevention data.
          </p>
        </TermsDialog>
      </main>
    </div>
  );
}
