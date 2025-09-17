import api from './api';

export const addToWishlist = async (villaId: number) => {
  const res = await api.post(`/wishlist/add/${villaId}`);
  return res.data;
};

export const removeFromWishlist = async (villaId: number) => {
  const res = await api.delete(`/wishlist/remove/${villaId}`);
  return res.data;
};

export const getWishlist = async () => {
  const res = await api.get('/wishlist');
  return res.data;
};
