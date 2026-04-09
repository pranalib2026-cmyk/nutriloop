import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  console.error("❌ CRITICAL: VITE_API_BASE_URL is missing from environment variables.");
}
const HEALTH_URL = (API_BASE || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '') + '/health';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// ─── Retry config ───
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

function isNetworkError(error) {
  return (
    !error.response &&
    (error.code === 'ECONNREFUSED' ||
     error.code === 'ERR_NETWORK' ||
     error.code === 'ECONNABORTED' ||
     error.message?.includes('Network Error'))
  );
}

// ─── Attach Firebase token to every request ───
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.__retryCount = config.__retryCount || 0;
  return config;
});

// ─── Auto-retry on network errors ───
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (isNetworkError(error) && config && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      console.warn(
        `⚠️ Backend unreachable (attempt ${config.__retryCount}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS}ms...`
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * config.__retryCount));
      return api(config);
    }

    if (error.response?.status === 401) {
      await auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Health check ───
export async function checkBackendHealth() {
  try {
    await axios.get(HEALTH_URL, { timeout: 5000 });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Wait until the backend server is reachable.
 * Polls /health every `intervalMs` up to `maxAttempts` times.
 * Returns true if backend came up, false if timed out.
 */
export async function waitForBackend(maxAttempts = 15, intervalMs = 2000) {
  for (let i = 1; i <= maxAttempts; i++) {
    const { ok } = await checkBackendHealth();
    if (ok) {
      console.log(`✅ Backend is ready (attempt ${i}/${maxAttempts})`);
      return true;
    }
    console.warn(`⏳ Waiting for backend... (${i}/${maxAttempts})`);
    if (i < maxAttempts) {
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
  console.error('❌ Backend did not become available');
  return false;
}

export default api;
