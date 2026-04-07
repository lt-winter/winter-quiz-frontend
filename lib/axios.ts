import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // URL của Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để xử lý 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("quiz-auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
