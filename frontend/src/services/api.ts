import axios from 'axios';

// O TypeScript agora reconhece VITE_API_URL graças ao arquivo .d.ts
const apiURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: apiURL,
});

export default api;