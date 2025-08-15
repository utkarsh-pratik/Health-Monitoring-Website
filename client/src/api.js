// javascript
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://health-monitoring-website.onrender.com';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

const api = axios.create({ baseURL: API_URL });

export default api;