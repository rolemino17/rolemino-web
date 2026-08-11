import { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { uploadDocuments } from "../api/api";
import toast from "react-hot-toast";

export function DocumentUpload() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appId = parseInt(searchParams.get("appId") || "0");
  const token = searchParams.get("token") || "";
  const jobTitle = decodeURIComponent(
    searchParams.get("jobTitle") || "the job"
  );
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  const [termsScrolled, setTermsScrolled] = useState(false);

  // Validate appId and token
  const isValidParams = appId > 0 && token.length === 36;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(
        file.type
      )
    ) {
      toast.error("Only PDF, PNG, JPEG, or JPG files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB.");
      return;
    }
    setter(file);
  };

  const handleRemoveFile = (
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
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
      toast.error("Please agree to the data privacy terms before submitting.");
      return;
    }
    if (!idFront) {
      toast.error("Please upload the front of your government-issued ID.");
      return;
    }
    setIsSubmitting(true);
    try {
      const documents = [idFront, idBack].filter(
        (file): file is File => file !== null
      );
      const formData = new FormData();
      documents.forEach((file) => formData.append("documents", file));
      await uploadDocuments(appId, token, formData);
      toast.success(
        "Documents uploaded successfully. You will receive a confirmation email."
      );
      setTimeout(() => navigate("/jobs"), 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to upload documents. Please try again."
        );
      } else {
        toast.error("Failed to upload documents. Please try again.");
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
          <span className="text-sm text-gray-500">
            Upload {label.toLowerCase()}
          </span>
          <input
            id={`${field}-input`}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={(e) => handleFileChange(e, setter)}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative w-full h-32 border border-gray-300 rounded-md overflow-hidden">
          {file.type.startsWith("image/") ? (
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
            ×
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
            The document upload link is invalid or expired. Please contact
            support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl lg:text-3xl font-bold mb-6">Upload Documents</h1>
        <p className="text-gray-600 mb-4">
          Please upload the required documents for your application to{" "}
          {jobTitle}.
        </p>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Government-Issued ID (Required)
            </h2>
            <p className="text-xs text-gray-600">
              Upload front and back of your driver’s license or national ID card
              (PDF, PNG, JPEG, or JPG, max 5MB each).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderFileInput("Front of ID", idFront, setIdFront, "idFront")}
              {renderFileInput("Back of ID", idBack, setIdBack, "idBack")}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={isPrivacyAgreed}
                onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
                disabled={!termsScrolled}
                className="mr-2 leading-tight text-xs md:text-sm"
              />
              I have read the Terms and Conditions{" "}
              <span className="text-red-500">*</span>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-blue-500 cursor-pointer underline ml-1"
              >
                (View Terms)
              </button>
            </label>
            {!termsScrolled && (
              <p className="text-xs md:text-sm text-red-500 mt-1">
                You must read and scroll to the bottom of the terms to enable
                this checkbox.
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isSubmitting || !isPrivacyAgreed}
          >
            {isSubmitting ? "Uploading..." : "Upload Documents"}
          </Button>
        </form>

        {isTermsModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
            <div
              ref={termsRef}
              className="bg-white p-6 rounded-lg shadow-lg w-[96%] mx-auto md:mx-0 md:w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-slideIn"
              tabIndex={0}
              role="dialog"
              aria-labelledby="terms-modal-title"
              onScroll={handleTermsScroll}
            >
              <h2 className="text-lg font-semibold mb-4">
                This Rolemino Data Consent Form (“Data Consent Form”) contains the
                following terms and conditions:
              </h2>
              <h3 className="font-medium mb-2">
                Rolemino Identity Verification Requirements
              </h3>
              <p className="text-gray-700 mb-3 text-sm">
                In accordance with Rolemino's Employee's Standards, and fraud and
                abuse prevention, you must undergo identity and location
                verification checks if you would like to be eligible for
                projects with Rolemino. The identity and location verification
                process will be completed as a part of the final steps in
                qualification before you can be onboarded to your first project
                with Rolemino. If you are successful in the other steps of
                qualification, you will be provided with the necessary
                instructions to complete the identity and location verification
                via email. This information will be retained so that you can
                more easily be eligible for other projects that require similar
                identification verifications.
              </p>

              <h3 className="font-medium mb-2">Processing of Personal Data</h3>
              <p className="text-gray-700 mb-3 text-sm">
                We will need to collect, use, and retain personal data from you,
                or from another entity you provide your personal data to, in
                order to: maintain community standards, execute the project
                requirements; communicate with you, comply with our legal
                obligations as required by law; and fulfill any other
                obligations we may have to our customers, vendors, or partners.
                Examples of this include, but are not limited to, your contact
                information to be able to contact you, your account information
                and what projects you worked on for our record-keeping purposes,
                your demographics information so we may offer you more relevant
                project opportunities, your payment information so we can pay
                you any owed amounts, other information for fraud
                detection/prevention purposes such as biometrics collection
                (e.g. facial recognition) for identify verification purposes.
                You understand, acknowledge, and agree to processing and storing
                of your personal data by Rolemino and its affiliates and vendors
                as necessary to exercise its rights and fulfill its obligations
                under this Agreement and your data may be transferred by such
                parties to the United States, Canada, the United Kingdom, the
                European Union, Australia, Philippines, and other countries as
                stated to you, but only for the purposes described herein. You
                further, understand, acknowledge, and agree that some of your
                personal data collected and processed is necessary to satisfy a
                contract to which you are a party to, and such processing is not
                based on consent and is not affected by your withdrawal of
                consent. However, certain special categories or “sensitive”
                personal data, such as data concerning health, biometric data,
                racial or ethnic origin, religious affiliation, which may be
                part of fraud prevention and project qualification requirements,
                may require your consent before we can process the information.
              </p>

              <h3 className="font-medium mb-2">
                Withdrawal of Consent and Right to Access Personal Data
              </h3>
              <p className="text-gray-700 mb-3 text-sm">
                If applicable law allows you such rights, you may withdraw your
                participation by contacting Rolemino at the following email:
                recruitment-team@rolemino.com.
              </p>

              <p className="text-gray-700 mb-3 text-sm">
                Please note that withdraw of your consent herein will prevent
                you from performing further work on existing projects and
                participating in any new or additional projects. After your
                withdrawal, Rolemino and its affiliates, customers, and vendors may
                continue to retain your information but only in accordance with
                their respective legal obligations and/or legitimate interests,
                such as your account information, what projects you participated
                in for account management and record-keeping purposes, and data
                collected necessary to maintain fraud prevention.
              </p>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="mt-4 w-full bg-green-500 text-white cursor-pointer p-2 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-gray-400"
                aria-label="Close modal"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
