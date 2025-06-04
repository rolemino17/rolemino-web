import axios from 'axios';
import type { Job, Application } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getJobs = () => api.get<Job[]>('/jobs').then((res) => res.data);
export const filterJobs = (filters: { location?: string; locationType?: string; domain?: string }) =>
  api.get<Job[]>('/jobs', { params: filters }).then((res) => res.data);
export const getJob = (id: string) => api.get<Job>(`/jobs/${id}`).then((res) => res.data);

export async function submitApplication(data: FormData | Partial<Application>) {
  const response = await api.post('/applications', 
    data instanceof FormData ? data : JSON.stringify(data), 
    {
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    }
  );
  if (!response.data) {
    const errorText = response.statusText || 'Unknown error';
    throw new Error(`Submission failed: ${errorText}`);
  }
  return response.data;
}

export async function uploadDocuments(appId: number, token: string, formData: FormData) {
  const response = await api.put(`/applications/${appId}/documents?token=${token}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data) {
    const errorText = response.statusText || 'Unknown error';
    throw new Error(`Document upload failed: ${errorText}`);
  }
  return response.data;
}

export default api;
