import api from './axios';

// Obtener registros de la bitácora con paginación
export const getBitacora = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/api/bitacora?page=${page}&limit=${limit}`);
  return data;
};

// Registrar una acción en la bitácora
export const postBitacora = async (registro) => {
  const { data } = await api.post('/api/bitacora', registro);
  return data;
};
