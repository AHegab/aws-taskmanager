import { jwtDecode } from 'jwt-decode';

export function getCurrentUser() {
  const token = localStorage.getItem('id_token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    // Check if token expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      localStorage.removeItem('id_token');
      localStorage.removeItem('user_id');
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
