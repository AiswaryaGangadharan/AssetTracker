import axios from 'axios';

const getApiUrl = () => {
  // Use the provided URL or fallback to localhost
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Normalization: Remove trailing slash
  url = url.replace(/\/$/, '');
  
  if (typeof window !== 'undefined') {
    console.log('Using API URL:', url);
  }
  
  return url;
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 60000, // 60 seconds to handle Render cold starts
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
      const token = localStorage.getItem('token');
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
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
