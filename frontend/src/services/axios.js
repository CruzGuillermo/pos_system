// src/services/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pos-system-t5am.onrender.com/api', // Cambialo según tu entorno
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
