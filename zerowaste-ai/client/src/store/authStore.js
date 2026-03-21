import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  setProfile: (profile) => set({ profile }),

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      set({ loading: true });
      if (firebaseUser) {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: firebaseUser, profile: data.user, loading: false });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          set({ user: firebaseUser, profile: null, loading: false });
        }
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
    return unsubscribe;
  },

  logout: async () => {
    await auth.signOut();
    set({ user: null, profile: null });
  }
}));

export default useAuthStore;
