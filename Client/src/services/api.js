import axios from 'axios';

const apiClient = axios.create({
  baseURL:
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userAPI = {
  login: (credentials) => apiClient.post('/users/login', credentials),
  logout: () => apiClient.post('/users/logout'),
  register: (userData) => apiClient.post('/users/register', userData),
  getAllUsers: () => apiClient.get('/users'),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  resetPassword: (email) => apiClient.post('/users/reset-password', { email }),
  sendResetOtp: (email) => apiClient.post('/users/forgot-password/send-otp', { email }),
  verifyResetOtp: (email, otp) => apiClient.post('/users/forgot-password/verify-otp', { email, otp }),
  confirmResetPassword: (email, otp, newPassword) =>
    apiClient.post('/users/forgot-password/reset', { email, otp, newPassword }),
};

export { apiClient };
