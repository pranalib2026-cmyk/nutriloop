import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import api, { waitForBackend } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  backendReady: false,   // tracks whether backend is confirmed reachable

  setProfile: (profile) => set({ profile }),

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      set({ loading: true });

      if (firebaseUser) {
        // Wait for backend to be reachable before fetching profile
        if (!get().backendReady) {
          const ready = await waitForBackend(15, 2000);
          set({ backendReady: ready });

          if (!ready) {
            console.warn('Backend not available — skipping profile fetch');
            set({ user: firebaseUser, profile: null, loading: false });
            return;
          }
        }

        try {
          const { data } = await api.get('/auth/me');
          set({ user: firebaseUser, profile: data.user, loading: false });
        } catch (error) {
          console.error('Error fetching user profile:', error?.response?.status || error.message);
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
  },
}));

export default useAuthStore;
