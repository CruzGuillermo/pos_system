// src/services/authService.js
import api from './axios';

export const login = async (usuario, contrasena) => {
  const response = await api.post('/login', { usuario, contrasena });
  return response.data;
};

export const register = async (datos) => {
  const response = await api.post('/register', datos);
  return response.data;
};
