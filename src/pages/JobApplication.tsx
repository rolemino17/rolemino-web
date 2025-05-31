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

  // Redirect to /jobs after feedback modal is shown
  useEffect(() => {
    if (isFeedbackModalOpen) {
      const timer = setTimeout(() => {
        navigate("/jobs");
      }, 6000); // Redirect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isFeedbackModalOpen, navigate]);

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
    if (file) {
      setResumeFile(file);
    }
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
      <div className="pt-20 pb-12 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Invalid Job ID</h1>
          <p className="text-red-500">
            The job ID provided is invalid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">
          Apply for Job: {job ? job.title : "Loading..."}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Middle Name
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                required
                maxLength={11} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Phone Country Code <span className="text-red-500">*</span>
              </label>
              <select
                name="phoneCountryCode"
                value={formData.phoneCountryCode || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {countryCodes.map(({ country, code, isoCode }) => (
                  <option key={isoCode} value={code}>
                    {code} ({country})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="streetName"
                value={formData.residentialAddress?.streetName || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.residentialAddress?.city || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.residentialAddress?.state || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.residentialAddress?.postalCode || ""}
                onChange={handleAddressChange}
                 maxLength={6} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={formData.residentialAddress?.country || ""}
                onChange={handleAddressChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Country of Birth <span className="text-red-500">*</span>
              </label>
              <select
                name="countryOfBirth"
                value={formData.countryOfBirth || ""}
                required
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Highest Education Level
              </label>
              <input
                type="text"
                name="highestEducationLevel"
                placeholder="eg. BSc., MBA, PhD"
                value={formData.highestEducationLevel || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Primary Spoken Language <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="primarySpokenLanguage"
                value={formData.primarySpokenLanguage || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Additional Language
              </label>
              <input
                type="text"
                name="additionalLanguage"
                value={formData.additionalLanguage || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Available Hours per week <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="availableHours"
                value={formData.availableHours || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Desired Pay Rate
              </label>
              <input
                type="text"
                name="expectedPay"
                placeholder="eg. $12/hr"
                value={formData.expectedPay || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                CV/Resume <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="resumeUrl"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                accept="application/pdf"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Additional Information
              </label>
              <textarea
                name="additionalInformation"
                value={formData.additionalInformation || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Include a cover letter or any additional info..."
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              <input
                type="checkbox"
                name="dataAgreement"
                checked={formData.dataAgreement || false}
                onChange={handleChange}
                disabled={!termsScrolled}
                className="mr-2 leading-tight"
              />
              I agree to the data processing terms{" "}
              <span className="text-red-500">*</span>
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
          onClose={() => setIsFeedbackModalOpen(false)}
          message="Application received successfully. You'll be redirected to the job explore page. Check your emails for further instructions."
          type="success"
          autoCloseDuration={6000}
        />

        {isTermsModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-25">
            <div
              className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto"
              ref={termsRef}
              onScroll={handleTermsScroll}
            >
              <h2 className="text-xl font-bold mb-4">Data Processing Terms</h2>
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in id est laborum.Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in id est laborum.Lorem ipsum
                dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Duis aute irure dolor in id est
                laborum. Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
                aute irure dolor in id est laborum.
              </p>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="mt-4 w-full bg-green-500 text-white cursor-pointer p-2 rounded-md"
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
