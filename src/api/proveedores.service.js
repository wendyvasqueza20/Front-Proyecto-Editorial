// src/api/proveedores.service.js
import api from './axios';

// 🔧 BASE correcta (plural y con v1)
const BASE = '/api/v1/proveedores';

// Helper de manejo seguro de respuestas/errores (igual patrón que articulos)
const safe = async (fn) => {
  try {
    const { data } = await fn();
    // Para listar devolvemos arreglo si la API a veces envía {rows:[]}
    return Array.isArray(data) ? data : (data?.rows ?? data?.proveedores ?? data ?? []);
  } catch (e) {
    console.error('[proveedores.service]', e?.response?.data || e?.message);
    throw new Error(e?.response?.data?.message || 'Error de comunicación con el servidor');
  }
};

// GET /api/v1/proveedores
export const listarProveedores = (params = {}) =>
  safe(() => api.get(BASE, { params }));

// GET /api/v1/proveedores/:id  (útil si lo usas en algún lado)
export const obtenerProveedor = (id) =>
  safe(() => api.get(`${BASE}/${Number(id)}`));

// POST /api/v1/proveedores
export const crearProveedor = (payload) =>
  safe(() => api.post(BASE, payload));

// PUT /api/v1/proveedores/:id
export const actualizarProveedor = (id, payload) =>
  safe(() => api.put(`${BASE}/${Number(id)}`, payload));

// PUT /api/v1/proveedores/:id/desactivar
export const desactivarProveedor = (id) =>
  safe(() => api.put(`${BASE}/${Number(id)}/desactivar`));

// PUT /api/v1/proveedores/:id/activar
export const activarProveedor = (id) =>
  safe(() => api.put(`${BASE}/${Number(id)}/activar`));

