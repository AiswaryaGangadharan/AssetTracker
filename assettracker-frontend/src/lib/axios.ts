import axios from 'axios';

const getApiUrl = () => {
  // Use the provided URL or fallback to localhost
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Normalization: Remove trailing slash
  url = url.replace(/\/$/, '');
  
  return url;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    // Note: In an SSR environment, localStorage is unavailable during render.
    // Ensure this runs only on the client side or fetch from cookies.
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
