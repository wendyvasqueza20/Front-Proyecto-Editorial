//src//views//Compras//ProveedoresMaestroDetalle
import React, { useEffect, useMemo, useState } from 'react'
import {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
  desactivarProveedor,
  activarProveedor,
} from '../../api/proveedores.service'
import {
  listarPorProveedor,
  crearArticulo,
  actualizarArticulo,
  normalizeArticulo,
} from '../../api/articulos.service'

const nombreCompletoProv = (p) =>
  [p.nombres_proveedor, p.apellidos_proveedor].filter(Boolean).join(' ').trim();

const pickProveedorPorTexto = (rows, q) => {
  if (!rows?.length) return null;
  const term = (q || '').toLowerCase().trim();
  if (!term) return rows[0]; // sin texto: primero de la lista

  const exact = rows.find(p => nombreCompletoProv(p).toLowerCase() === term);
  if (exact) return exact;

  const parcial = rows.find(p => nombreCompletoProv(p).toLowerCase().includes(term));
  if (parcial) return parcial;

  // ⚠️ Importante: si hay texto pero NO hay match, no mantener el anterior
  return null;
};




export default function ProveedoresMaestroDetalle() {
  // Proveedores
  const [proveedores, setProveedores] = useState([])
  const [qProv, setQProv] = useState('')
  const [showInactivosProv, setShowInactivosProv] = useState(false)
  const [selProvId, setSelProvId] = useState(null)
  const [selProvObj, setSelProvObj] = useState(null)
  const [loadingProv, setLoadingProv] = useState(false)
  const [err, setErr] = useState('')

  // Artículos
  const [articulos, setArticulos] = useState([])
  const [loadingArt, setLoadingArt] = useState(false)
  const [qArt, setQArt] = useState('')
  const [selArt, setSelArt] = useState(null)

  // Formularios Proveedor
  const [showProvForm, setShowProvForm] = useState(false)
  const [modeProv, setModeProv] = useState('crear')
  const [provForm, setProvForm] = useState({
    nombres_proveedor: '',
    apellidos_proveedor: '',
    identidad: '',
    telefono: '',
    correo: '',
    direccion: '',
  })

  // Formularios Artículo
  const [showArtForm, setShowArtForm] = useState(false)
  const [modeArt, setModeArt] = useState('crear')
  const [artForm, setArtForm] = useState({
    nombre_articulo: '',
    tipo_articulo: '',
    gramaje: '',
    medidas_standard: '',
  })

  // Cargar Proveedores
  const cargarProveedores = async () => {
  setErr('');
  setLoadingProv(true);
  try {
    const data = await listarProveedores({ inactivos: showInactivosProv, q: qProv });
    const rows = Array.isArray(data) ? data : data?.rows || data?.proveedores || [];
    setProveedores(rows);

    const elegido = pickProveedorPorTexto(rows, qProv);
    if (elegido) {
      const id = elegido.id_proveedor || elegido.id;
      setSelProvObj(elegido);
      setSelProvId(id);
      // 🔧 Fuerza cargar artículos del proveedor elegido de inmediato
      await cargarArticulos(id);
    } else {
      // No hay match con el texto -> sin selección y sin artículos
      setSelProvId(null);
      setSelProvObj(null);
      setArticulos([]);
    }
  } catch (e) {
    setErr(e.message || 'Error cargando proveedores');
  } finally {
    setLoadingProv(false);
  }
};



//Ejecuta carga de proveedores al cambiar "Mostrar inactivos"
useEffect(() => { cargarProveedores() }, [showInactivosProv])

//Recarga proveedores cuando se escribe en el buscador (búsqueda en tiempo real)
useEffect(() => {
  const t = setTimeout(() => { cargarProveedores(); }, 400);
  return () => clearTimeout(t);
}, [qProv]); 

const onBuscarProv = (e) => { if (e.key === 'Enter') cargarProveedores() }



  // Cargar Artículos
  const cargarArticulos = async (idProv) => {
    if (!idProv) return
    setErr('')
    setLoadingArt(true)
    try {
      const data = await listarPorProveedor(idProv)
      const raw = Array.isArray(data) ? data : data?.articulos || data?.rows || []
      setArticulos((raw || []).map(normalizeArticulo))
    } catch (e) { setErr(e.message || 'Error cargando artículos') }
    finally { setLoadingArt(false) }
  }
  useEffect(() => { if (selProvId) cargarArticulos(selProvId) }, [selProvId])

  // Acciones Proveedor
  const provAccionEstado = async (p) => {
    try {
      if ((p.estado || 'ACTIVO') === 'ACTIVO') {
        await desactivarProveedor(p.id_proveedor || p.id)
        alert('Proveedor desactivado')
      } else {
        await activarProveedor(p.id_proveedor || p.id)
        alert('Proveedor activado')
      }
      await cargarProveedores()
    } catch (e) { alert(e.message || 'Error cambiando estado del proveedor') }
  }

  const abrirCrearProveedor = () => {
    setModeProv('crear')
    setProvForm({ nombres_proveedor: '', apellidos_proveedor: '', identidad: '', telefono: '', correo: '', direccion: '' })
    setShowProvForm(true)
  }

  const abrirEditarProveedorFila = (p) => {
    const id = p.id_proveedor || p.id
    setSelProvId(id)
    setSelProvObj(p)
    setModeProv('editar')
    setProvForm({
      nombres_proveedor: p.nombres_proveedor || '',
      apellidos_proveedor: p.apellidos_proveedor || '',
      identidad: p.identidad || '',
      telefono: p.telefono || '',
      correo: p.correo || '',
      direccion: p.direccion || '',
    })
    setShowProvForm(true)
  }

  const guardarProveedor = async () => {
    try {
      if (modeProv === 'crear') { await crearProveedor(provForm); alert('Proveedor creado') }
      else { await actualizarProveedor(selProvId, provForm); alert('Proveedor actualizado') }
      setShowProvForm(false)
      await cargarProveedores()
    } catch (e) { alert(e.message || 'Error guardando proveedor') }
  }

  // Acciones Artículo
  const abrirCrearArticulo = (forceProvId = null) => {
    const pid = forceProvId ?? selProvId
    if (!pid) return alert('Selecciona un proveedor')
    setSelProvId(pid)
    setModeArt('crear')
    setArtForm({ nombre_articulo: '', tipo_articulo: '', gramaje: '', medidas_standard: '' })
    setShowArtForm(true)
  }

  const abrirEditarArticuloFila = (a) => {
    setSelArt(a)
    setModeArt('editar')
    setArtForm({
      nombre_articulo: a.nombre_articulo || '',
      tipo_articulo: a.tipo_articulo || '',
      gramaje: a.gramaje || '',
      medidas_standard: a.medidas_standard || '',
    })
    setShowArtForm(true)
  }

  const guardarArticulo = async () => {
    try {
      if (modeArt === 'crear') {
        await crearArticulo({ ...artForm, id_proveedor: selProvId })
        alert('Artículo creado')
      } else {
        const id = selArt.id_articulo || selArt.id_materiaPrima || selArt.id
        await actualizarArticulo(id, { ...artForm, id_proveedor: selProvId })
        alert('Artículo actualizado')
      }
      setShowArtForm(false)
      await cargarArticulos(selProvId)
    } catch (e) { alert(e.message || 'Error guardando artículo') }
  }

  // Reporte PDF rápido
  const generarReporte = () => {
    const prov = proveedores.find((p) => (p.id_proveedor || p.id) === selProvId)
    const nombreProv = prov ? [prov.nombres_proveedor, prov.apellidos_proveedor].filter(Boolean).join(' ') : '—'
    const html = `
      <html><head><title>Reporte Proveedores & Artículos</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px}
        h1{margin:0 0 10px} h2{margin:20px 0 6px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #999;padding:6px} th{background:#eee;text-align:left}
      </style></head><body>
      <h1>Proveedores & Artículos</h1>
      <h2>Proveedor seleccionado: ${nombreProv}</h2>
      <h3>Proveedores</h3>
      <table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Estado</th></tr></thead><tbody>
      ${proveedores.map(p=>{
        const n=[p.nombres_proveedor,p.apellidos_proveedor].filter(Boolean).join(' ')
        return `<tr><td>${n}</td><td>${p.telefono||''}</td><td>${p.correo||''}</td><td>${p.estado||'ACTIVO'}</td></tr>`
      }).join('')}
      </tbody></table>
      <h3>Artículos del proveedor</h3>
      <table><thead><tr><th>Nombre</th><th>Tipo</th><th>Gramaje</th><th>Medidas</th></tr></thead><tbody>
      ${(articulos||[]).map(a=>`<tr><td>${a.nombre_articulo||''}</td><td>${a.tipo_articulo||''}</td><td>${a.gramaje||''}</td><td>${a.medidas_standard||''}</td></tr>`).join('')}
      </tbody></table>
      <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}</script>
      </body></html>`
    const w = window.open('', '_blank'); w.document.open(); w.document.write(html); w.document.close()
  }

  // Filtro artículos
  const articulosFiltrados = useMemo(() => {
    const term = (qArt || '').toLowerCase().trim()
    if (!term) return articulos
    return articulos.filter((a) =>
      (a.nombre_articulo || '').toLowerCase().includes(term) ||
      (a.tipo_articulo || '').toLowerCase().includes(term) ||
      (a.gramaje || '').toLowerCase().includes(term)
    )
  }, [qArt, articulos])

  // UI
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4" style={{ color: '#fff' }}>
      {/* Proveedores */}
      <div className="md:col-span-4">
        <div className="p-4 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-danger">Proveedores</h3>
            <div className="flex items-center gap-2">
              <button className="btn btn-success btn-sm" onClick={() => abrirCrearProveedor()}>Agregar proveedor</button>
              <button className="btn btn-outline-info btn-sm" onClick={generarReporte}>Generar PDF</button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showInactivosProv} onChange={(e)=>setShowInactivosProv(e.target.checked)} />
              Mostrar inactivos
            </label>
            <div className="flex items-center gap-2">
              <input
                className="form-control bg-dark text-white"
                style={{ width: 220 }}
                placeholder="Buscar proveedor..."
                value={qProv}
                onChange={(e)=>setQProv(e.target.value)}
                onKeyDown={onBuscarProv}
              />
              <button className="btn btn-secondary" onClick={cargarProveedores}>Buscar</button>
            </div>
          </div>

          {loadingProv ? <p>Cargando proveedores...</p> : null}
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm table text-white">
              <thead>
                <tr>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Teléfono</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(proveedores || []).map((p) => {
                  const id = p.id_proveedor || p.id
                  const nombre = [p.nombres_proveedor, p.apellidos_proveedor].filter(Boolean).join(' ')
                  const activo = (p.estado || 'ACTIVO') === 'ACTIVO'
                  return (
                    <tr key={id}>
                      <td className="p-2">{nombre || '—'}</td>
                      <td className="p-2">{p.telefono || '—'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${activo ? 'bg-success' : 'bg-secondary'}`}>
                          {activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="p-2 d-flex flex-wrap gap-2">



                        <button
                          className={`btn btn-sm ${activo ? 'btn-warning text-dark' : 'btn-success'}`}
                          style={{ backgroundColor: activo ? '#FFA559' : '' }}
                          onClick={() => provAccionEstado(p)}
                        >
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>

                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => abrirEditarProveedorFila(p)}
                        >
                          Actualizar proveedor
                        </button>



                        
                        <button className="btn btn-success btn-sm" onClick={() => abrirCrearArticulo(p.id_proveedor || p.id)}>
                          Agregar artículo
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Artículos */}
      <div className="md:col-span-8">
        <div className="p-4 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-danger">Artículos del proveedor seleccionado</h3>
            <div className="flex items-center gap-2">
              <input
                className="form-control bg-dark text-white"
                style={{ width: 220 }}
                placeholder="Buscar artículo..."
                value={qArt}
                onChange={(e)=>setQArt(e.target.value)}
              />
            </div>
          </div>

          {!selProvId ? <p>Selecciona un proveedor para ver sus artículos.</p> : null}
          {loadingArt ? <p>Cargando artículos...</p> : null}
          {!loadingArt && selProvId ? (
            <table className="w-full text-sm table text-white">
              <thead>
                <tr>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Gramaje</th>
                  <th className="text-left p-2">Medidas</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articulosFiltrados.map((a) => (
                  <tr key={a.id_articulo || a.id_materiaPrima}>
                    <td className="p-2">{a.nombre_articulo || '—'}</td>
                    <td className="p-2">{a.tipo_articulo || '—'}</td>
                    <td className="p-2">{a.gramaje || '—'}</td>
                    <td className="p-2">{a.medidas_standard || '—'}</td>
                    <td className="p-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => abrirEditarArticuloFila(a)}
                      >
                        Actualizar
                      </button>

                    </td>
                  </tr>
                ))}
                {articulosFiltrados.length === 0 && (
                  <tr>
                    <td className="p-4" colSpan={5}>No hay artículos para este proveedor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : null}
          {err ? <p className="text-danger mt-3">{err}</p> : null}
        </div>
      </div>

      {/* Modal Proveedor */}
      {showProvForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center">
          <div className="bg-dark text-white p-4 rounded-3 shadow" style={{ width: 520 }}>
            <h5 className="mb-3">{modeProv === 'crear' ? 'Agregar proveedor' : 'Actualizar proveedor'}</h5>
            <div className="row g-2">
              <div className="col-6"><input className="form-control bg-secondary text-white" placeholder="Nombres" value={provForm.nombres_proveedor} onChange={(e)=>setProvForm({...provForm,nombres_proveedor:e.target.value})} /></div>
              <div className="col-6"><input className="form-control bg-secondary text-white" placeholder="Apellidos" value={provForm.apellidos_proveedor} onChange={(e)=>setProvForm({...provForm,apellidos_proveedor:e.target.value})} /></div>
              <div className="col-6"><input className="form-control bg-secondary text-white" placeholder="Identidad" value={provForm.identidad} onChange={(e)=>setProvForm({...provForm,identidad:e.target.value})} /></div>
              <div className="col-6"><input className="form-control bg-secondary text-white" placeholder="Teléfono" value={provForm.telefono} onChange={(e)=>setProvForm({...provForm,telefono:e.target.value})} /></div>
              <div className="col-12"><input className="form-control bg-secondary text-white" placeholder="Correo" value={provForm.correo} onChange={(e)=>setProvForm({...provForm,correo:e.target.value})} /></div>
              <div className="col-12"><textarea className="form-control bg-secondary text-white" placeholder="Dirección" value={provForm.direccion} onChange={(e)=>setProvForm({...provForm,direccion:e.target.value})} /></div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-light" onClick={()=>setShowProvForm(false)}>Cancelar</button>
              <button className="btn btn.success btn-sm d-none" />
              <button className="btn btn-success" onClick={guardarProveedor}>{modeProv === 'crear' ? 'Guardar' : 'Actualizar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Artículo */}
      {showArtForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center">
          <div className="bg-dark text-white p-4 rounded-3 shadow" style={{ width: 520 }}>
            <h5 className="mb-3">{modeArt === 'crear' ? 'Agregar artículo' : 'Actualizar artículo'}</h5>
            <div className="row g-2">
              <div className="col-12"><input className="form-control bg-secondary text-white" placeholder="Nombre" value={artForm.nombre_articulo} onChange={(e)=>setArtForm({...artForm,nombre_articulo:e.target.value})} /></div>
              <div className="col-6"><input className="form-control bg-secondary text-white" placeholder="Tipo" value={artForm.tipo_articulo} onChange={(e)=>setArtForm({...artForm,tipo_articulo:e.target.value})} /></div>
              <div className="col-3"><input className="form-control bg-secondary text-white" placeholder="Gramaje" value={artForm.gramaje} onChange={(e)=>setArtForm({...artForm,gramaje:e.target.value})} /></div>
              <div className="col-3"><input className="form-control bg-secondary text-white" placeholder="Medidas" value={artForm.medidas_standard} onChange={(e)=>setArtForm({...artForm,medidas_standard:e.target.value})} /></div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-outline-light" onClick={()=>setShowArtForm(false)}>Cancelar</button>
              <button className="btn btn-success" onClick={guardarArticulo}>{modeArt === 'crear' ? 'Guardar' : 'Actualizar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
