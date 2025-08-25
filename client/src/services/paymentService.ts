import api from './api';

export async function createVillaListingPayment(submissionId: number, promoted: boolean) {
  const res = await api.post('/payments/villa-listing', { submissionId, promoted });
  return res.data as { clientSecret: string };
}

export async function promoteVilla(villaId: number) {
  // This endpoint should be implemented in the backend to create a payment intent for promotion
  const res = await api.post('/payments/villa-promote', { villaId });
  return res.data as { clientSecret: string };
}
