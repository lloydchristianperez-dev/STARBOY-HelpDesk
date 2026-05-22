import axios from 'axios';

// Production-safe API URL resolution:
// 1) Use REACT_APP_API_URL when provided
// 2) In production fallback to Render backend
// 3) In local development fallback to localhost
const resolvedBaseURL = process.env.REACT_APP_API_URL
  || (process.env.NODE_ENV === 'production'
    ? 'https://starboy-helpdesk.onrender.com/api'
    : 'http://localhost:5000/api');

const API = axios.create({
  baseURL: resolvedBaseURL,
});

// Add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
