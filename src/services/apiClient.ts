// src/services/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api", // Configura esto en .env
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opcional: Interceptor de respuesta para manejar errores 401 globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // No hagas logout automático aquí si estás en /login para evitar bucles
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        // Redirigir a login, se puede hacer mejor con un contexto de Auth
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
