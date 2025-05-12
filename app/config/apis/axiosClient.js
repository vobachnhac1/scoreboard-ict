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
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    console.error('API error:', error);
    return Promise.reject(error);
  }
);

export default axiosClient;
