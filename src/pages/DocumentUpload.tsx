import { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { getJob, uploadDocuments } from '../api/api';
import toast from 'react-hot-toast';

export function DocumentUpload() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appId = parseInt(searchParams.get('appId') || '0');
  const token = searchParams.get('token') || '';
  const [isUSResident, setIsUSResident] = useState(false);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [ssnFront, setSsnFront] = useState<File | null>(null);
  const [ssnBack, setSsnBack] = useState<File | null>(null);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  const [termsScrolled, setTermsScrolled] = useState(false);

  // Validate appId and token
  const isValidParams = appId > 0 && token.length === 36;

  // Fetch job details for context (optional)
  const { data: job } = useQuery({
    queryKey: ['job', appId],
    queryFn: async () => {
      const application = await getJob(appId.toString());
      return application;
    },
    enabled: isValidParams,
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    // field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only PDF, PNG, JPEG, or JPG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB.');
      return;
    }
    setter(file);
  };

  const handleRemoveFile = (setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    setter(null);
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setTermsScrolled(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivacyAgreed) {
      toast.error('Please agree to the data privacy terms before submitting.');
      return;
    }
    if (!idFront) {
      toast.error('Please upload the front of your government-issued ID.');
      return;
    }
    if (isUSResident && (!ssnFront || !ssnBack)) {
      toast.error('Please upload both front and back of your SSN card.');
      return;
    }

    setIsSubmitting(true);
    try {
      const documents = [idFront, idBack, ...(isUSResident ? [ssnFront, ssnBack] : [])].filter(
        (file): file is File => file !== null
      );
      await uploadDocuments(appId, token, documents);
      toast.success('Documents uploaded successfully. You will receive a confirmation email.');
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to upload documents. Please try again.');
      } else {
        toast.error('Failed to upload documents. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileInput = (
    label: string,
    file: File | null,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    field: string
  ) => (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-medium">{label}</label>
      {!file ? (
        <label
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition"
          htmlFor={`${field}-input`}
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-500">Click to upload {label.toLowerCase()}</span>
          <input
            id={`${field}-input`}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={(e) => handleFileChange(e, setter,)}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative w-full h-32 border border-gray-300 rounded-md overflow-hidden">
          {file.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(file)}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-gray-500">{file.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => handleRemoveFile(setter)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            aria-label={`Remove ${label}`}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );

  if (!isValidParams) {
    return (
      <div className="pt-20 pb-12 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Invalid Link</h1>
          <p className="text-red-500">
            The document upload link is invalid or expired. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Upload Documents for Job Application</h1>
        <p className="text-gray-600 mb-4">
          Please upload the required documents for your application to {job?.title || 'the job'}.
        </p>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Government-Issued ID (Required)</h2>
            <p className="text-xs text-gray-600">
              Upload front and back of your driver’s license or national ID card (PDF, PNG, JPEG, or JPG, max 5MB each).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderFileInput('Front Of ID', idFront, setIdFront, 'idFront')}
              {renderFileInput('Back Of ID', idBack, setIdBack, 'idBack')}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isUSResident}
                onChange={(e) => setIsUSResident(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm font-medium">
                I am a U.S. citizen or resident
              </span>
            </label>
            {isUSResident && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Social Security Number (SSN) Card</h2>
                <p className="text-sm text-gray-600">
                  Upload front and back of your SSN card (PDF, PNG, JPEG, or JPG, max 5MB each).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderFileInput('SSN Front', ssnFront, setSsnFront, 'ssnFront')}
                  {renderFileInput('SSN Back', ssnBack, setSsnBack, 'ssnBack')}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={isPrivacyAgreed}
                onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
                disabled={!termsScrolled}
                className="mr-2 leading-tight"
              />
              I agree to the data privacy terms <span className="text-red-500">*</span>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-blue-500 underline ml-1"
              >
                (View Terms)
              </button>
            </label>
            {!termsScrolled && (
              <p className="text-sm text-red-500 mt-1">
                You must read and scroll to the bottom of the terms to enable this checkbox.
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="accent"
            className="w-full sm:w-auto"
            disabled={isSubmitting || !isPrivacyAgreed}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Documents'}
          </Button>
        </form>

        {isTermsModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
            <div
              ref={termsRef}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto animate-slideIn"
              tabIndex={0}
              role="dialog"
              aria-labelledby="terms-modal-title"
              onScroll={handleTermsScroll}
            >
              <h2 id="terms-modal-title" className="text-xl font-bold mb-4">
                Data Privacy Terms
              </h2>
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat.Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat.Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo
                consequat.exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat.
              </p>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="mt-4 w-full bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
