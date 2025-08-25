import api from './api';

export async function requestOwnerAccess() {
  const res = await api.post('/owner/request-access');
  return res.data;
}

export async function deleteVilla(id: number) {
  return api.delete(`/owner/properties/${id}`);
}
