
// src/views/Compras/ProveedoresMaestroDetalle.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
  desactivarProveedor,
  activarProveedor,
} from '../../api/proveedores.service';

import {
  listarArticulos,
  listarPorProveedor,
  crearArticulo,
  actualizarArticulo,
  normalizeArticulo,
} from '../../api/articulos.service';

// Util: estado activo/inactivo robusto (acepta string o 1/0)
const esActivo = (estado) => {
  if (estado === undefined || estado === null || String(estado).trim() === '') return true;
  const s = String(estado).toUpperCase();
  if (s === 'ACTIVO') return true;
  if (s === 'INACTIVO') return false;
  return estado === 1 || estado === '1' || estado === true;
};

const nombreCompletoProv = (p = {}) =>
  [p.nombres_proveedor || '', p.apellidos_proveedor || ''].join(' ').trim();

export default function ProveedoresMaestroDetalle() {
  // Proveedores
  const [proveedores, setProveedores] = useState([]);
  const [qProv, setQProv] = useState('');
  const [showInactivosProv, setShowInactivosProv] = useState(false);
  const [loadingProv, setLoadingProv] = useState(false);

  // Selección
  const [selProvId, setSelProvId] = useState(null);
  const selProv = useMemo(
    () => proveedores.find(p => (p.id_proveedor === selProvId)) || null,
    [proveedores, selProvId]
  );

  // Artículos
  const [articulos, setArticulos] = useState([]);
  const [loadingArt, setLoadingArt] = useState(false);

  // Errores
  const [err, setErr] = useState('');

  // Modal Proveedor
  const [showProvModal, setShowProvModal] = useState(false);
  const [provForm, setProvForm] = useState({
    nombres_proveedor: '',
    apellidos_proveedor: '',
    identidad: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'ACTIVO',
  });
  const [provEditId, setProvEditId] = useState(null);

  // Modal Artículo
  const [showArtModal, setShowArtModal] = useState(false);
  const [artForm, setArtForm] = useState({
    nombre_articulo: '',
    tipo_articulo: '',
    gramaje: '',
    medidas_standard: '',
    id_proveedor: null,
  });
  const [artEditId, setArtEditId] = useState(null);

  // ---------- Carga de datos ----------

  const cargarProveedores = async () => {
    setLoadingProv(true);
    setErr('');
    try {
      const rows = await listarProveedores({ q: qProv, inactivos: showInactivosProv });
      setProveedores(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setErr(e.message || 'Error cargando proveedores');
    } finally {
      setLoadingProv(false);
    }
  };

  const cargarArticulosDe = async (idProv) => {
    if (!idProv) {
      setArticulos([]);
      return;
    }
    setLoadingArt(true);
    setErr('');
    try {
      const data = await listarPorProveedor(idProv);
      const raw = Array.isArray(data) ? data : data?.rows || data?.data || [];
      setArticulos((raw || []).map(normalizeArticulo));
    } catch (e) {
      setErr(e.message || 'Error cargando artículos');
    } finally {
      setLoadingArt(false);
    }
  };

  const cargarArticulosTodos = async () => {
    setLoadingArt(true);
    setErr('');
    try {
      const data = await listarArticulos();
      const raw = Array.isArray(data) ? data : data?.rows || data?.data || [];
      setArticulos((raw || []).map(normalizeArticulo));
      setSelProvId(null);
    } catch (e) {
      setErr(e.message || 'Error cargando artículos');
    } finally {
      setLoadingArt(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, [qProv, showInactivosProv]);

  useEffect(() => {
    cargarArticulosDe(selProvId);
  }, [selProvId]);

  // ---------- Handlers Proveedor ----------

  const onAgregarProveedor = () => {
    setProvEditId(null);
    setProvForm({
      nombres_proveedor: '',
      apellidos_proveedor: '',
      identidad: '',
      telefono: '',
      correo: '',
      direccion: '',
      estado: 'ACTIVO',
    });
    setShowProvModal(true);
  };

  const onActualizarProveedor = (p) => {
    setProvEditId(p?.id_proveedor || null);
    setProvForm({
      nombres_proveedor: p?.nombres_proveedor || '',
      apellidos_proveedor: p?.apellidos_proveedor || '',
      identidad: p?.identidad || '',
      telefono: p?.telefono || '',
      correo: p?.correo || '',
      direccion: p?.direccion || '',
      estado: esActivo(p?.estado) ? 'ACTIVO' : 'INACTIVO',
    });
    setShowProvModal(true);
  };

  const provAccionEstado = async (p) => {
    const activo = esActivo(p.estado);
    const accion = activo ? 'desactivar' : 'activar';
    const ok = window.confirm(`¿Seguro que deseas ${accion} al proveedor "${nombreCompletoProv(p)}"?`);
    if (!ok) return;
    try {
      if (activo) await desactivarProveedor(p.id_proveedor);
      else await activarProveedor(p.id_proveedor);
      await cargarProveedores();
    } catch (e) {
      alert(e.message || 'No se pudo cambiar el estado del proveedor');
    }
  };

  const onSubmitProveedor = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...provForm };
      if (provEditId) {
        await actualizarProveedor(provEditId, payload);
      } else {
        await crearProveedor(payload);
      }
      setShowProvModal(false);
      await cargarProveedores();
    } catch (e) {
      alert(e.message || 'No se pudo guardar el proveedor');
    }
  };

  // ---------- Handlers Artículo ----------

  const onAgregarArticulo = (p) => {
    const idProv = (p?.id_proveedor || selProvId || null);
    if (!idProv) {
      alert('Selecciona un proveedor primero.');
      return;
    }
    setArtEditId(null);
    setArtForm({
      nombre_articulo: '',
      tipo_articulo: '',
      gramaje: '',
      medidas_standard: '',
      id_proveedor: idProv,
    });
    setShowArtModal(true);
  };

  const onActualizarArticulo = (a) => {
    setArtEditId(a?.id_articulo || null);
    setArtForm({
      nombre_articulo: a?.nombre_articulo || '',
      tipo_articulo: a?.tipo_articulo || '',
      gramaje: a?.gramaje || '',
      medidas_standard: a?.medidas_standard || '',
      id_proveedor: a?.id_proveedor || selProvId || null,
    });
    setShowArtModal(true);
  };

  const onSubmitArticulo = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...artForm };
      if (!payload.id_proveedor) {
        alert('Falta id_proveedor');
        return;
      }
      if (artEditId) {
        await actualizarArticulo(artEditId, payload);
      } else {
        await crearArticulo(payload);
      }
      setShowArtModal(false);
      if (selProvId) await cargarArticulosDe(selProvId);
      else await cargarArticulosTodos();
    } catch (e) {
      alert(e.message || 'No se pudo guardar el artículo');
    }
  };

  // ---------- Render ----------

  return (
    <div className="container-fluid py-3">
      <h2 className="mb-3">Proveedores y Artículos</h2>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-3">
  {/* Proveedores */}
  <div className="col-12">
    <div className="card shadow-sm mb-4">
      <div className="card-header d-flex flex-wrap align-items-center gap-2 bg-white">
        <strong className="me-auto fs-5">Proveedores</strong>
        <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            placeholder="Buscar proveedor..."
            className="form-control form-control-sm"
            value={qProv}
            onChange={(e) => setQProv(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="chkInactivos"
              checked={showInactivosProv}
              onChange={(e) => setShowInactivosProv(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="chkInactivos">
              Mostrar inactivos
            </label>
          </div>
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={onAgregarProveedor}
          >
            Agregar proveedor
          </button>
        </div>
      </div>
      <div className="card-body p-0 bg-white">
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th className="text-end" style={{width: 220}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingProv && (
                <tr><td colSpan={6} className="text-center py-3">Cargando...</td></tr>
              )}
              {!loadingProv && proveedores.length === 0 && (
                <tr><td colSpan={6} className="text-center py-3">Sin proveedores</td></tr>
              )}
              {!loadingProv && proveedores.map((p, idx) => {
                const activo = esActivo(p.estado);
                return (
                  <tr key={p.id_proveedor}>
                    <td>{idx + 1}</td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-link p-0 ${selProvId === p.id_proveedor ? 'fw-bold' : ''}`}
                        onClick={() => setSelProvId(p.id_proveedor)}
                        title="Ver artículos"
                      >
                        {nombreCompletoProv(p)}
                      </button>
                    </td>
                    <td>{p.telefono || '-'}</td>
                    <td>{p.correo || '-'}</td>
                    <td>
                      <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'}`}>
                        {activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => onActualizarProveedor(p)}
                        >
                          Actualizar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() => onAgregarArticulo(p)}
                        >
                          + Artículo
                        </button>
                        <button
                          type="button"
                          className={`btn ${activo ? 'btn-warning text-dark' : 'btn-success'}`}
                          onClick={() => provAccionEstado(p)}
                        >
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  {/* Artículos */}
  <div className="col-12">
    <div className="card shadow-sm bg-white">
      <div className="card-header d-flex align-items-center gap-2 bg-white">
        <strong className="me-auto fs-5">
          {selProv ? `Artículos de ${nombreCompletoProv(selProv)}` : 'Artículos'}
        </strong>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-info btn-sm"
            onClick={cargarArticulosTodos}
          >
            Ver todos
          </button>
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={() => onAgregarArticulo(selProv)}
            disabled={!selProvId}
          >
            Agregar artículo
          </button>
        </div>
      
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Gramaje</th>
                <th>Medidas</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingArt && (
                <tr><td colSpan={6} className="text-center py-3">Cargando...</td></tr>
              )}
              {!loadingArt && articulos.length === 0 && (
                <tr><td colSpan={6} className="text-center py-3">
                  {selProvId ? 'Este proveedor no tiene artículos' : 'Seleccione un proveedor o pulse "Ver todos"'}
                </td></tr>
              )}
              {!loadingArt && articulos.map((a, idx) => (
                <tr key={a.id_articulo ?? idx}>
                  <td>{idx + 1}</td>
                  <td>{a.nombre_articulo}</td>
                  <td>{a.tipo_articulo}</td>
                  <td>{a.gramaje}</td>
                  <td>{a.medidas_standard}</td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => onActualizarArticulo(a)}
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* MODAL: Proveedor */}
      {showProvModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{provEditId ? 'Actualizar proveedor' : 'Nuevo proveedor'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowProvModal(false)} />
              </div>
              <form onSubmit={onSubmitProveedor}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombres</label>
                      <input
                        className="form-control"
                        value={provForm.nombres_proveedor}
                        onChange={(e) => setProvForm(f => ({ ...f, nombres_proveedor: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Apellidos</label>
                      <input
                        className="form-control"
                        value={provForm.apellidos_proveedor}
                        onChange={(e) => setProvForm(f => ({ ...f, apellidos_proveedor: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Identidad</label>
                      <input
                        className="form-control"
                        value={provForm.identidad}
                        onChange={(e) => setProvForm(f => ({ ...f, identidad: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input
                        className="form-control"
                        value={provForm.telefono}
                        onChange={(e) => setProvForm(f => ({ ...f, telefono: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Correo</label>
                      <input
                        type="email"
                        className="form-control"
                        value={provForm.correo}
                        onChange={(e) => setProvForm(f => ({ ...f, correo: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Dirección</label>
                      <input
                        className="form-control"
                        value={provForm.direccion}
                        onChange={(e) => setProvForm(f => ({ ...f, direccion: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        value={provForm.estado}
                        onChange={(e) => setProvForm(f => ({ ...f, estado: e.target.value }))}
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProvModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Artículo */}
      {showArtModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{artEditId ? 'Actualizar artículo' : 'Nuevo artículo'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowArtModal(false)} />
              </div>
              <form onSubmit={onSubmitArticulo}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label">Nombre del artículo</label>
                      <input
                        className="form-control"
                        value={artForm.nombre_articulo}
                        onChange={(e) => setArtForm(f => ({ ...f, nombre_articulo: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tipo</label>
                      <input
                        className="form-control"
                        value={artForm.tipo_articulo}
                        onChange={(e) => setArtForm(f => ({ ...f, tipo_articulo: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Gramaje</label>
                      <input
                        className="form-control"
                        value={artForm.gramaje}
                        onChange={(e) => setArtForm(f => ({ ...f, gramaje: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Medidas</label>
                      <input
                        className="form-control"
                        value={artForm.medidas_standard}
                        onChange={(e) => setArtForm(f => ({ ...f, medidas_standard: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Proveedor (id)</label>
                      <input
                        className="form-control"
                        value={artForm.id_proveedor ?? ''}
                        onChange={(e) => setArtForm(f => ({ ...f, id_proveedor: Number(e.target.value) || null }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowArtModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
