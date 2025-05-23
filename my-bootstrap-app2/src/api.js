import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  // withCredentials: true,  // enable if you later want to send cookies automatically
});
api.interceptors.request.use((config) => {
  console.log('→ API Request ▶︎', {
    url: `${config.baseURL}${config.url}`,
    method: config.method,
    headers: { ...config.headers }
  });

  // Get the token from cookies or localStorage
  let token;
  const cookieMatch = document.cookie
    .split('; ')
    .find(row => row.startsWith('idToken='));
  
  if (cookieMatch) {
    token = cookieMatch.split('=')[1];
  } else {
    // Fallback to localStorage if cookie not found
    token = localStorage.getItem('idToken');
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log('   • attached Authorization:', config.headers.Authorization);
  } else {
    console.warn('   ⚠️ no idToken found in cookies or localStorage');
    // Don't throw here, let the server respond with 401
  }

  return config;
}, err => Promise.reject(err));
export default api;
