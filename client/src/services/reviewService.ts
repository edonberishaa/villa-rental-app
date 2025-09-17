import api from './api';

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  villaId: number;
  authorEmail: string;
  createdAt: string;
  photoUrls?: string[];
}

export const createReviewWithPhotos = async (
  villaId: number,
  data: { rating: number; comment?: string; authorEmail: string; images?: File[] }
) => {
  const form = new FormData();
  form.append('Rating', String(data.rating));
  if (data.comment) form.append('Comment', data.comment);
  form.append('AuthorEmail', data.authorEmail);
  if (data.images) {
    data.images.forEach((img, i) => form.append('images', img));
  }
  const res = await api.post(`/villas/${villaId}/reviews/with-photos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data as Review;
};

export const getReviews = async (villaId: number): Promise<Review[]> => {
  const res = await api.get(`/villas/${villaId}/reviews`);
  return res.data as Review[];
};

export const createReview = async (villaId: number, data: { rating: number; comment?: string; authorEmail: string }): Promise<Review> => {
  const res = await api.post(`/villas/${villaId}/reviews`, data);
  return res.data as Review;
};


