import axios from 'axios';

// Create an Axios instance using the base URL from environment variables
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/' : 'http://localhost:8000'),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the JWT token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // authService saves JWT under 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for responses to handle 401 errors
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops and handle only 401
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/login/') && !originalRequest.url.includes('/api/auth/refresh/')) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { authService } = await import('./authService');
      
      return new Promise((resolve, reject) => {
        authService.refreshToken()
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            processQueue(null, token);
            resolve(apiClient(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            // Optionally redirect to login here if not in a component
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  }
);
