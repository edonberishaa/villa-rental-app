import api from './api';

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PropertySubmissionDTO {
  id: number;
  ownerEmail: string;
  name: string;
  region: string;
  description?: string;
  pricePerNight: number;
  imageUrlsJson: string;
  amenitiesJson: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: number; // backend enum
  createdAt: string;
}

export const listSubmissions = async (status?: SubmissionStatus) => {
  const params = status ? { status } : undefined;
  const res = await api.get<PropertySubmissionDTO[]>(`/submissions`, { params });
  return res.data;
};

export const approveSubmission = async (id: number) => {
  const res = await api.post(`/submissions/${id}/approve`);
  return res.data;
};

export const rejectSubmission = async (id: number) => {
  const res = await api.post(`/submissions/${id}/reject`);
  return res.data;
};


