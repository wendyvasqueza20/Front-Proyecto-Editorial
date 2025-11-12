//src//api//articulos.service.js
import api from './axios';

// SOLO aceptamos llaves explícitas de PK de materia prima / artículo
const pickArticuloId = (a = {}) =>
  a.id_materiaPrima ?? a.id_materia_prima ?? a.idMateriaPrima ?? a.IdMateriaPrima ??
  a.id_articulo ?? a.idArticulo ?? null;

export const normalizeArticulo = (a = {}) => {
  const id = pickArticuloId(a);
  return {
    id_articulo: id,
    id_materiaPrima: a.id_materiaPrima ?? a.id_materia_prima ?? a.idMateriaPrima ?? a.IdMateriaPrima ?? null,
    nombre_articulo: a.nombre_articulo ?? a.nombre ?? a.descripcion ?? '',
    tipo_articulo: a.tipo_articulo ?? a.tipo ?? '',
    gramaje: a.gramaje ?? a.gramaje_mp ?? null,
    medidas_standard: a.medidas_standard ?? a.medidas ?? a.tamano ?? null,
    id_proveedor: a.id_proveedor ?? a.proveedor_id ?? null,
    precio_unitario: a.precio_unitario ?? a.precio ?? a.costo ?? null,
    disponible: (a.disponible ?? a.activo ?? true) ? true : false,
    __raw: a,
  };
};

// 🔧 BASE correcta (plural y con v1)
const BASE = '/api/v1/articulos';

const safe = async (fn) => {
  try { const { data } = await fn(); return data ?? []; }
  catch (e) { console.error('[articulos.service]', e?.response?.data || e?.message); throw new Error(e?.response?.data?.message || 'Error de comunicación con el servidor'); }
};

export const listarArticulos = (params = {}) =>
  safe(() => api.get(BASE, { params }));

export const listarPorProveedor = (id_proveedor) =>
  safe(() => api.get(`/api/v1/articulos/proveedor/${id_proveedor}`));


export const crearArticulo = (payload) =>
  safe(() => api.post(BASE, payload));

export const actualizarArticulo = (id, payload) => {
  const realId = Number(id);
  return safe(() => api.put(`${BASE}/${realId}`, payload));
};

export const eliminarArticulo = (id) => {
  const realId = Number(id);
  return safe(() => api.delete(`${BASE}/${realId}`));
};

// Proveedores para combo (usa directamente v1)
export const listarProveedoresCombo = async () => {
  const { data } = await api.get('/api/v1/proveedores');
  return Array.isArray(data) ? data : (data?.proveedores ?? []);
};
