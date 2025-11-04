// src/utils/auth.js

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;

  // Opcional: validar expiración del JWT (si es JWT)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    // Si no es JWT válido, asumimos que es válido mientras exista
    return true;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};