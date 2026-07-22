import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000/api';

// Create Axios Instance
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT token to requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service functions
const signup = async (userData) => {
  const response = await authAxios.post('/auth/signup', userData);
  return response.data;
};

const login = async (userData) => {
  const response = await authAxios.post('/auth/login', userData);
  return response.data;
};

const logout = async () => {
  const response = await authAxios.post('/auth/logout');
  return response.data;
};

const getCurrentUser = async () => {
  const response = await authAxios.get('/auth/me');
  return response.data;
};

// Update name and/or password
const updateProfile = async (data) => {
  const response = await authAxios.put('/auth/profile', data);
  return response.data;
};

// Upload avatar image (File object)
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await authAxios.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

const authService = {
  signup,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  authAxios // exported for other services to use if needed
};

export default authService;
