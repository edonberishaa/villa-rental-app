import api from './api';

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  villaId: number;
  authorEmail: string;
  createdAt: string;
}

export const getReviews = async (villaId: number): Promise<Review[]> => {
  const res = await api.get(`/villas/${villaId}/reviews`);
  return res.data as Review[];
};

export const createReview = async (villaId: number, data: { rating: number; comment?: string; authorEmail: string }): Promise<Review> => {
  const res = await api.post(`/villas/${villaId}/reviews`, data);
  return res.data as Review;
};


