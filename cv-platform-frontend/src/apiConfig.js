import axios from 'axios';

export const API_BASE_URL = 'http://192.168.1.19:3001'; // ajuste conforme seu backend

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para tratar token expirado (erro 401)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken'); // Remove o token expirado
      window.location.href = '/admin/login'; // Redireciona para login
    }
    return Promise.reject(error);
  }
);

export default api;