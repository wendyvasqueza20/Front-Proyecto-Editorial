import api from './axios';

// SOLO aceptamos llaves explícitas de PK de materia prima / artículo
const pickArticuloId = (a = {}) =>
  a.id_materiaPrima ?? a.id_materia_prima ?? a.idMateriaPrima ?? a.IdMateriaPrima ??
  a.id_articulo ?? a.idArticulo ?? null;

export const normalizeArticulo = (a = {}) => {
  const id = pickArticuloId(a);
  return {
    // mantenemos ambos por compatibilidad, pero NO usamos 'id' genérico
    id_articulo: id,
    id_materiaPrima: a.id_materiaPrima ?? a.id_materia_prima ?? a.idMateriaPrima ?? a.IdMateriaPrima ?? null,
    nombre_articulo: a.nombre_articulo ?? a.nombre ?? a.descripcion ?? '',
    tipo_articulo: a.tipo_articulo ?? a.tipo ?? '',
    gramaje: a.gramaje ?? a.gramaje_mp ?? null,
    medidas_standard: a.medidas_standard ?? a.medidas ?? null,
    id_proveedor: a.id_proveedor ?? a.proveedor_id ?? null,
    precio_unitario: a.precio_unitario ?? a.precio ?? a.costo ?? null,
    disponible: (a.disponible ?? a.activo ?? true) ? true : false,
    // guardamos el registro crudo por si se necesita
    __raw: a,
  };
};

const BASE = '/api/v1/articulo';

const safe = async (fn) => {
  try {
    const { data } = await fn();
    return data;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
    throw new Error(msg || 'Error de comunicación con servidor');
  }
};

// Primero intentamos con query param porque tu backend 404 en /proveedor/:id
export const listarPorProveedor = async (idProveedor) => {
  const candidates = [
    `${BASE}?proveedor=${idProveedor}`,
    `${BASE}?id_proveedor=${idProveedor}`,
    `${BASE}/proveedor/${idProveedor}` // último
  ];
  let last;
  for (const u of candidates) {
    try {
      const { data } = await api.get(u);
      return data;
    } catch (e) { last = e; }
  }
  throw new Error(last?.response?.data?.message || last?.message || 'Error de comunicación con servidor');
};

export const crearArticulo = (payload) => safe(() => api.post(`${BASE}`, payload));

export const actualizarArticulo = (id, payload) => {
  const realId = Number(id);
  return safe(() => api.put(`${BASE}/${realId}`, payload));
};

export const eliminarArticulo = (id) => {
  const realId = Number(id);
  return safe(() => api.delete(`${BASE}/${realId}`));
};

export const listarProveedoresCombo = async () => {
  try {
    const { data } = await api.get('/api/proveedores');
    return Array.isArray(data) ? data : (data?.proveedores ?? []);
  } catch {
    const { data } = await api.get('/api/v1/proveedores');
    return Array.isArray(data) ? data : (data?.proveedores ?? []);
  }
};
