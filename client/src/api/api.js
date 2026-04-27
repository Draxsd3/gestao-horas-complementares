import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const baseURL = configuredBaseURL.replace(/^"+|"+$/g, '').replace(/\/+$/, '');

const api = axios.create({
    baseURL
});

export default api;
