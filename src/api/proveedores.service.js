import api from './axios';

// Helpers para manejo uniforme de errores y respuestas vacías
const safe = async (fn) => {
  try {
    const { data } = await fn();
    return data || [];
  } catch (err) {
    // Opcional: log local para depuración
    console.error('[proveedores.service] error:', err?.response?.data || err?.message);
    // Propaga un objeto con mensaje manejable por el componente
    throw new Error(err?.response?.data?.message || 'Error de comunicación con el servidor');
  }
};

export const listarProveedores = (opts = {}) => {
  const params = new URLSearchParams();
  if (opts.inactivos) params.set('inactivos','true');
  if (opts.q) params.set('q', opts.q);
  const qs = params.toString();
  return safe(() => api.get(`/api/proveedores${qs ? ('?' + qs) : ''}`));
};

export const crearProveedor = (payload) => safe(() => api.post('/api/proveedores', payload));

export const actualizarProveedor = (id, payload) => safe(() => api.put(`/api/proveedores/${id}`, payload));

export const eliminarProveedor = (id) => safe(() => api.delete(`/api/proveedores/${id}`));


export const desactivarProveedor = (id) => safe(() => api.put(`/api/proveedores/${id}/desactivar`));

export const activarProveedor = (id) => safe(() => api.put(`/api/proveedores/${id}/activar`));
