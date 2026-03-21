import api from './api';

export const getNearbyFood = async (params) => {
  const res = await api.get('/match/nearby-food', { params });
  return res.data;
};
