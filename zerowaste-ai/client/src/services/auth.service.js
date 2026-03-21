import api from './api';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const USE_MOCK = import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_KEY_HERE' || !import.meta.env.VITE_FIREBASE_API_KEY;

export const login = async (email, password) => {
  if (USE_MOCK) {
    return { uid: 'mock-uid', email, getIdToken: async () => `mock-token-${email}` };
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const register = async (email, password, userData) => {
  if (USE_MOCK) {
    const mockUid = 'mock-' + Date.now();
    const token = `mock-token-${email}`;
    const res = await api.post('/auth/register', {
      firebaseUid: mockUid,
      email,
      ...userData
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const token = await user.getIdToken();
  
  const res = await api.post('/auth/register', {
    firebaseUid: user.uid,
    email,
    ...userData
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return res.data;
};
