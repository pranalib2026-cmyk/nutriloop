import api from './api';

export const createListing = async (formData) => {
  const res = await api.post('/food', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getListings = async (params) => {
  const res = await api.get('/food', { params });
  return res.data;
};

export const getMyListings = async (params) => {
  const res = await api.get('/food/my/listings', { params });
  return res.data;
};
