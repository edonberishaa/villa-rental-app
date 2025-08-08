import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7021/api', // Update this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
