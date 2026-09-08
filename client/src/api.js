import axios from 'axios';

// Base URL for the backend API.
// - Local dev: falls back to the local Express server.
// - Production: set REACT_APP_API_URL in the Netlify site settings
//   (e.g. https://sahay-backend.onrender.com).
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL });

// Attach the stored JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// When the server rejects a token as invalid/expired, broadcast so the
// AuthContext can log the user out and surface a message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default api;
