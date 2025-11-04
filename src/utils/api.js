// src/utils/api.js
import { refreshToken } from './auth';

export const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('access_token');

  // Si no hay token, falla
  if (!token) {
    throw new Error('No autorizado');
  }

  const makeRequest = async (useToken) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${useToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 401) {
      // Intentar refrescar token
      const newToken = await refreshToken();
      if (newToken) {
        return makeRequest(newToken); // reintentar con nuevo token
      } else {
        window.location.href = '/#/login'; // forzar logout
        throw new Error('Sesión expirada');
      }
    }

    return res;
  };

  return makeRequest(token);
};