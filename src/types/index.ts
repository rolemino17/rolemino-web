// types.ts
export interface Job {
  id: number;
  title: string;
  company: string;
  locationType: string;
  location: string;
  domain: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  compensation?: string;
  createdAt: Date;
}

export interface ResidentialAddress {
  streetName: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Application {
  id: number;
  jobId: number;
  email: string;
  phone?: string;
  resumeUrl: string;
  expectedPay?: string;
  dataAgreement: boolean;
  documentUrls: string[];
  createdAt: Date;
  token: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneCountryCode?: string;
  residentialAddress: ResidentialAddress;
  additionalInformation?: string;
  additionalLanguage?: string;
  availableHours?: number;
  countryOfBirth?: string;
  highestEducationLevel?: string;
  primarySpokenLanguage?: string;
  job: Job;
}
