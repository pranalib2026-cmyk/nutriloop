import { create } from 'zustand';

export const useFoodStore = create((set) => ({
  listings: [],
  total: 0,
  page: 1,
  filters: { category: '', radius: 10, status: 'pending' },
  setListings: (listings, total, page) => set({ listings, total, page }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 })),
  setPage: (page) => set({ page }),
}));
