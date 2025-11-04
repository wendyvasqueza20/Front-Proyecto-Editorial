import api from './axios'

// Helper de manejo uniforme de errores
const safe = async (fn) => {
  try {
    const { data } = await fn()
    return data ?? null
  } catch (err) {
    console.error('[cuentaspagar.service] error:', err?.response?.data || err?.message)
    throw new Error(err?.response?.data?.message || 'Error de comunicación con el servidor')
  }
}

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.rows)) return payload.rows
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.abonos)) return payload.abonos
  if (Array.isArray(payload.pagos)) return payload.pagos
  if (Array.isArray(payload.historial)) return payload.historial
  if (Array.isArray(payload.PagoCxp)) return payload.PagoCxp
  return []
}

// Base oficial que estás usando
const BASE_V1 = '/api/v1/cuentas-por-pagar'
const BASE = '/api/cuentas-por-pagar'

// --- CxP principales ---
export const listarCxP = (params = {}) =>
  safe(() => api.get(BASE_V1, { params })).then(pickArray)

export const obtenerCxP = (id) =>
  safe(() => api.get(`${BASE_V1}/${id}`))

export const crearCxP = (payload) =>
  safe(() => api.post(BASE_V1, payload))

export const actualizarCxP = (id, payload) =>
  safe(() => api.put(`${BASE_V1}/${id}`, payload))

export const eliminarCxP = (id) =>
  safe(() => api.delete(`${BASE_V1}/${id}`))

// --- Abonos/Pagos ---
export const listarAbonos = async (idCxP) => {
  // 1) Intenta en /api/v1/:id/abonos
  try {
    const d1 = await safe(() => api.get(`${BASE_V1}/${idCxP}/abonos`))
    const arr1 = pickArray(d1)
    if (arr1.length) return arr1
  } catch (_) {}

  // 2) Intenta en /api/:id/abonos (sin v1)
  try {
    const d2 = await safe(() => api.get(`${BASE}/${idCxP}/abonos`))
    const arr2 = pickArray(d2)
    if (arr2.length) return arr2
  } catch (_) {}

  // 3) Fallback: GET por id y busca campos comunes
  try {
    const cxp1 = await obtenerCxP(idCxP)
    const arr3 = pickArray(cxp1)
    if (arr3.length) return arr3
    // buscar anidados explícitos
    const nest = pickArray(cxp1?.data) || pickArray(cxp1?.cxp) || pickArray(cxp1?.result)
    if (nest.length) return nest
    if (Array.isArray(cxp1?.abonos)) return cxp1.abonos
    if (Array.isArray(cxp1?.pagos)) return cxp1.pagos
    if (Array.isArray(cxp1?.historial)) return cxp1.historial
  } catch (_) {}

  // 4) Último intento: GET /api (sin v1) por id
  try {
    const { data: cxp2 } = await api.get(`${BASE}/${idCxP}`)
    const arr4 = pickArray(cxp2)
    if (arr4.length) return arr4
    if (Array.isArray(cxp2?.abonos)) return cxp2.abonos
    if (Array.isArray(cxp2?.pagos)) return cxp2.pagos
    if (Array.isArray(cxp2?.historial)) return cxp2.historial
  } catch (_) {}

  return []
}

export const crearAbono = (idCxP, payload) =>
  safe(() => api.post(`${BASE_V1}/${idCxP}/abonos`, payload))

export const eliminarAbono = (idAbono) =>
  safe(() => api.delete(`/api/v1/cuentas/abonos/${idAbono}`))
