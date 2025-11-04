export const isAuthenticated = () => !!localStorage.getItem('access_token');

export const logout = async () => {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (token && user.id_usuario) {
    try {
      await fetch('http://localhost:5000/api/v1/bitacora/cierre-sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          accion: 'CIERRE_SESION',
          descripcion: `El usuario ${user.usuario} cerró sesión`,
        }),
      });
    } catch (e) {
      console.warn('No se pudo registrar en bitácora:', e);
    }
  }

  ['access_token', 'refresh_token', 'user'].forEach((k) => localStorage.removeItem(k));
};