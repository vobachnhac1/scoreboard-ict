// src/api/axiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:6789/api', // thay đổi thành base URL của bạn
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor (ví dụ thêm token nếu có)
axiosClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token'); // hoặc từ Redux
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor (xử lý lỗi 401, 500,...)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) {
    //   // Ví dụ: tự động logout hoặc refresh token
    //   console.warn('Unauthorized, please login again');
    // }
    return Promise.reject(error);
  }
);

export default axiosClient;
