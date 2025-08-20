import api from './api';

export async function requestOwnerAccess() {
  const res = await api.post('/owner/request-access');
  return res.data;
}
