// src/utils/api.js (Corregido)
import { refreshToken } from './auth';

export const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('access_token');

  // Si no hay token, falla
  if (!token) {
    throw new Error('No autorizado');
  }

  // -----------------------------------------------------------------
  // INICIO DE LA CORRECCIÓN
  // Se añade 'retried' para controlar que solo se reintente UNA VEZ.
  // -----------------------------------------------------------------
  const makeRequest = async (useToken, retried = false) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${useToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401) {
      // -----------------------------------------------------------------
      // SI FALLA POR 401:
      // 1. Verificamos si YA lo habíamos reintentado.
      // -----------------------------------------------------------------
      if (retried) {
        // Si ya lo reintentamos y volvió a fallar, nos rendimos.
        window.location.href = '/#/login'; // forzar logout
        throw new Error('Sesión expirada después de reintento');
      }

      // -----------------------------------------------------------------
      // 2. Si es el primer fallo (retried = false), intentamos refrescar.
      // -----------------------------------------------------------------
      try {
        const newToken = await refreshToken();
        if (newToken) {
          // ¡Conseguimos token nuevo! Reintentamos la llamada original.
          // Esta vez pasamos 'retried = true'.
          return makeRequest(newToken, true);
        } else {
          // refreshToken() falló o no devolvió token.
          window.location.href = '/#/login'; // forzar logout
          throw new Error('Sesión expirada, no se pudo refrescar');
        }
      } catch (error) {
        // Error durante el refresh.
        window.location.href = '/#/login'; // forzar logout
        throw new Error('Error de sesión');
      }
    }

    return res;
  };

  // Llamada inicial (siempre es 'retried = false')
  return makeRequest(token, false);
};