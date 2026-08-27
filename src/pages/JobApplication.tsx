import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/Button";
import { FeedbackModal } from "../components/FeedBackModal";
import { Application, ResidentialAddress } from "../types";
import { countries } from "../data/CountryList";
import { getJob, submitApplication } from "../api/api";
import { customList } from "country-codes-list";
import toast from "react-hot-toast";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export function JobApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = id ? parseInt(id) : NaN; // Parse id to number
  const [formData, setFormData] = useState<Partial<Application>>({
    jobId: isNaN(jobId) ? undefined : jobId,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+1",
    resumeUrl: "",
    residentialAddress: {
      streetName: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    expectedPay: "",
    highestEducationLevel: "",
    primarySpokenLanguage: "",
    additionalLanguage: "",
    countryOfBirth: "",
    availableHours: undefined,
    additionalInformation: "",
    dataAgreement: false,
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  const [termsScrolled, setTermsScrolled] = useState(false);
  
   useEffect(() => {
    window.scrollTo(0, 0);
  }, [])


  const { data: job } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id!),
    enabled: !!id && !isNaN(jobId), // Only run query if id is valid
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Partial<Application>) => {
      // Validate required fields
      const requiredFields = {
        jobId: data.jobId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        residentialAddress: data.residentialAddress,
        dataAgreement: data.dataAgreement,
      };
      for (const [key, value] of Object.entries(requiredFields)) {
        if (
          value === undefined ||
          (typeof value === "string" && value.trim() === "") ||
          (key === "residentialAddress" &&
            (!value || Object.values(value).some((v) => !v)))
        ) {
          throw new Error(
            `Please fill out the ${key.replace(
              "residentialAddress",
              "residential address"
            )} field.`
          );
        }
      }
      if (!resumeFile) {
        throw new Error("Please upload a resume.");
      }
      if (resumeFile.size > MAX_RESUME_SIZE) {
        throw new Error("Resume file must not exceed 5 MB.");
      }
      if (isNaN(data.jobId!)) {
        throw new Error("Invalid job ID.");
      }

      const formDataToSend = new FormData();
      // Prepare JSON payload for non-file data
      const jsonData = {
        jobId: data.jobId,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        phoneCountryCode: data.phoneCountryCode,
        residentialAddress: data.residentialAddress,
        expectedPay: data.expectedPay,
        highestEducationLevel: data.highestEducationLevel,
        primarySpokenLanguage: data.primarySpokenLanguage,
        additionalLanguage: data.additionalLanguage,
        countryOfBirth: data.countryOfBirth,
        availableHours: data.availableHours,
        additionalInformation: data.additionalInformation,
        dataAgreement: data.dataAgreement,
      };
      formDataToSend.append("applicationData", JSON.stringify(jsonData));
      formDataToSend.append("resume", resumeFile);

      const response = await submitApplication(formDataToSend);
      return response;
    },
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        resumeUrl: data.resumeUrl,
      }));
      setIsSubmitting(false);
      setIsFeedbackModalOpen(true);
    },
    onError: (error: unknown) => {
      setIsSubmitting(false);
      if (error instanceof Error) {
        console.error("Submission error:", error.message);
        toast.error(
          error.message || "Failed to submit application. Please try again."
        );
      } else {
        console.error("Submission error:", error);
        toast.error("Failed to submit application. Please try again.");
      }
    },
  });

  const handleFeedbackClose = () => {
    setIsFeedbackModalOpen(false);
    navigate("/jobs");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: string | number | boolean = value;
    if (type === "checkbox" && "checked" in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    } else if (name === "availableHours") {
      fieldValue = value ? parseInt(value) : "";
    }
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      residentialAddress: {
        ...prev.residentialAddress,
        [name]: value,
      } as ResidentialAddress,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setResumeFile(null);
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setResumeFile(null);
      e.currentTarget.value = "";
      toast.error("Resume file must not exceed 5 MB.");
      return;
    }

    setResumeFile(file);
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setTermsScrolled(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dataAgreement) {
      toast.error(
        "Please agree to the data processing terms before submitting."
      );
      return;
    }
    setIsSubmitting(true);
    submitMutation.mutate(formData);
  };

  interface CountryCodeEntry {
    country: string;
    code: string;
    isoCode: string;
  }

  const countryCodes: CountryCodeEntry[] = Object.values(
    customList(
      "countryCode",
      "{countryNameEn}|{countryCallingCode}|{countryCode}"
    )
  )
    .map((entry: string) => {
      const [country, callingCode, isoCode] = entry.split("|");
      return {
        country,
        code: `+${callingCode}`,
        isoCode,
      };
    })
    .filter((entry: CountryCodeEntry) => entry.code !== "+undefined");

  if (isNaN(jobId)) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-canvas">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6 text-primary">Invalid Job ID</h1>
          <p className="text-danger">
            The job ID provided is invalid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-base lg:text-3xl font-bold mb-6 text-primary">
          Apply for {job ? job.title : "Loading..."}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-surface p-6 rounded-lg shadow-md border border-default space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Middle Name
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName || ""}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Phone <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                required
                maxLength={11}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Phone Country Code <span className="text-danger">*</span>
              </label>
              <select
                name="phoneCountryCode"
                value={formData.phoneCountryCode || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              >
                {countryCodes.map(({ country, code, isoCode }) => (
                  <option key={isoCode} value={code}>
                    {code} ({country})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Street Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="streetName"
                value={formData.residentialAddress?.streetName || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                City <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.residentialAddress?.city || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                State <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.residentialAddress?.state || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Postal Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.residentialAddress?.postalCode || ""}
                onChange={handleAddressChange}
                maxLength={6}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Country <span className="text-danger">*</span>
              </label>
              <select
                name="country"
                value={formData.residentialAddress?.country || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Country of Birth <span className="text-danger">*</span>
              </label>
              <select
                name="countryOfBirth"
                value={formData.countryOfBirth || ""}
                required
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Highest Education Level <span className="text-danger">*</span>
              </label>
              <select
                name="highestEducationLevel"
                value={formData.highestEducationLevel || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              >
                <option value="" disabled>
                  Select Education Level
                </option>
                <option value="Primary education (elementary school)">
                  Primary education (elementary school)
                </option>
                <option value="Some secondary education (high school)">
                  Some secondary education (high school)
                </option>
                <option value="Secondary education completed (high school diploma or equivalent)">
                  Secondary education completed (high school diploma or
                  equivalent)
                </option>
                <option value="Vocational/technical training or certification (eg. Trade school)">
                  Vocational/technical training or certification (eg. Trade
                  school)
                </option>
                <option value="Some college or university (no degree)">
                  Some college or university (no degree)
                </option>
                <option value="Associate's degree (eg AA, AS)">
                  Associate's degree (eg AA, AS)
                </option>
                <option value="Bachelor's degree (eg. BA, BS)">
                  Bachelor's degree (eg. BA, BS)
                </option>
                <option value="Post Graduate diploma or certificate (non degree)">
                  Post Graduate diploma or certificate (non degree)
                </option>
                <option value="Master's degree (eg. MA, MS, MBA, MFA)">
                  Master's degree (eg. MA, MS, MBA, MFA)
                </option>
                <option value="Doctoral or professional degree (eg. PhD, MD, JD)">
                  Doctoral or professional degree (eg. PhD, MD, JD)
                </option>
                <option value="No Formal education">No Formal education</option>
              </select>
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Primary Spoken Language <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="primarySpokenLanguage"
                value={formData.primarySpokenLanguage || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Additional Language
              </label>
              <input
                type="text"
                name="additionalLanguage"
                value={formData.additionalLanguage || ""}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Available Hours per week <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="availableHours"
                value={formData.availableHours || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              />
            </div>
            {/* <div>
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Desired Pay Rate
              </label>
              <input
                type="text"
                name="expectedPay"
                placeholder="eg. $12/hr"
                value={formData.expectedPay || ""}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
              />
            </div> */}
            <div className="sm:col-span-2">
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                CV/Resume <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                name="resumeUrl"
                onChange={handleFileChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none"
                accept="application/pdf"
                required
              />
              <p className="mt-1 text-xs text-secondary">PDF only, maximum size 5 MB.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-strong-secondary text-sm font-medium mb-1">
                Additional Information
              </label>
              <textarea
                name="additionalInformation"
                value={formData.additionalInformation || ""}
                onChange={handleChange}
                className="w-full p-2 border border-default rounded-md bg-surface text-primary placeholder:text-muted hover:border-strong focus:border-brand focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:outline-none h-24"
                placeholder="Include a cover letter or any additional info..."
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-strong-secondary text-sm font-medium mb-1">
              <input
                type="checkbox"
                name="dataAgreement"
                checked={formData.dataAgreement || false}
                onChange={handleChange}
                disabled={!termsScrolled}
                className="mr-2 leading-tight accent-[var(--color-action-primary)] border-default text-xs md:text-sm"
              />
              I have read the Terms and Conditions{" "}
              <span className="text-danger">*</span>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-brand cursor-pointer underline hover:text-[var(--color-action-link-hover)] ml-1"
              >
                (View Terms)
              </button>
            </label>
            {!termsScrolled && (
              <p className="text-xs md:text-sm text-danger mt-1">
                You must read and scroll to the bottom of the terms to enable
                this checkbox.
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>

        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={handleFeedbackClose}
          message="Application received successfully. You'll be redirected to the opportunities page. Check your emails for further instructions."
          type="success"
          autoCloseDuration={3500}
        />

        {isTermsModalOpen && (
          <div className="fixed inset-0 bg-[var(--color-overlay)] backdrop-blur-sm flex items-center justify-center z-25">
            <div
              className="bg-surface p-6 rounded-lg border border-default w-[96%] mx-auto md:mx-0 md:w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              ref={termsRef}
              onScroll={handleTermsScroll}
            >
              <h2 className="text-lg font-semibold mb-4">
                This Rolemino Data Consent Form (“Data
                Consent Form”) contains the following terms and conditions:{" "}
              </h2>
              <h3 className="font-medium mb-2">
                Rolemino Identity Verification Requirements
              </h3>
              <p className="text-secondary mb-3 text-sm">
                In accordance with Rolemino&apos;s Employee's Standards, and fraud
                and abuse prevention, you must undergo identity and location
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

              <p className="text-secondary mb-3 text-sm">
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
                of your personal data by Rolemino and its affiliates and vendors as
                necessary to exercise its rights and fulfill its obligations
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
              <p className="text-secondary mb-3 text-sm">
                If applicable law allows you such rights, you may withdraw your
                participation by contacting Rolemino at the following
                email:careers@rolemino.com.
              </p>

              <p className="text-secondary mb-3 text-sm">
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
                className="mt-4 w-full bg-[var(--color-action-success)] text-inverse cursor-pointer p-2 rounded-md hover:bg-[var(--color-action-success-hover)]"
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
