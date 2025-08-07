// src/services/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Cambialo según tu entorno
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
