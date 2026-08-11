import axios from 'axios';
import type { Job, Application } from '../types';

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (!error.response) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  if (error.response.status >= 500) {
    return 'Something went wrong. Please try again.';
  }

  const responseMessage = error.response.data?.error || error.response.data?.message;
  return responseMessage || fallback;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getJobs = () => api.get<Job[]>('/jobs').then((res) => res.data);
export const filterJobs = (filters: { location?: string; locationType?: string; domain?: string }) =>
  api.get<Job[]>('/jobs', { params: filters }).then((res) => res.data);
export const getJob = (id: string) => api.get<Job>(`/jobs/${id}`).then((res) => res.data);

export async function submitApplication(data: FormData | Partial<Application>) {
  try {
    const response = await api.post('/applications',
      data instanceof FormData ? data : JSON.stringify(data),
      {
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      }
    );
    if (!response.data) {
      throw new Error('The server returned an empty response.');
    }
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to submit application. Please try again.'));
  }
}

export async function uploadDocuments(appId: number, token: string, formData: FormData) {
  try {
    const response = await api.put(`/applications/${appId}/documents?token=${token}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data) {
      throw new Error('The server returned an empty response.');
    }
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to upload documents. Please try again.'));
  }
}

export default api;
