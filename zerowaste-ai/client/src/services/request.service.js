import api from './api';

export const createRequest = async (data) => {
  const res = await api.post('/requests', data);
  return res.data;
};

export const getMyRequests = async (params) => {
  const res = await api.get('/requests/my', { params });
  return res.data;
};

export const updateRequestStatus = async (id, data) => {
  const res = await api.patch(`/requests/${id}/status`, data);
  return res.data;
};

export const cancelRequest = async (id) => {
  const res = await api.delete(`/requests/${id}`);
  return res.data;
};
