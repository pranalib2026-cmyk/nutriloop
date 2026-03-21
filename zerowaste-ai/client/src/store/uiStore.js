import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isGlobalLoading: false,
  setGlobalLoading: (status) => set({ isGlobalLoading: status }),
}));
