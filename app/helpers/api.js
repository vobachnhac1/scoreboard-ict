import axios from 'axios';

const axiosClient = axios.create({
    baseURL: "http://localhost:6789",
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 giây timeout
});

// (Tuỳ chọn) Thêm interceptor để xử lý request
axiosClient.interceptors.request.use(
    (config) => {
        // Ví dụ: Thêm token nếu có
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// (Tuỳ chọn) Interceptor cho response
axiosClient.interceptors.response.use(
    (response) => {
        // Kiểm tra xem dữ liệu có trả về trong response không và gán nó vào `data`
        if (response && response.data) {
            return response.data; // Trả về phần data của response
        }
        return response;
    },
    (error) => {
        console.error('API error:', error);
        return Promise.reject(error);
    }
);

export default axiosClient;
