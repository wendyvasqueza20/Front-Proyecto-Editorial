import React, { useEffect, useMemo, useState } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormLabel,
  CForm,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CFormSelect,
} from '@coreui/react'
import ReporteModal from '../../components/Reportes/ReporteModal'

import {
  listarCxP,
  crearAbono,
  crearCxP,
  listarAbonos,
} from '../../api/cuentaspagar.service'
import { listarProveedores } from '../../api/proveedores.service'

// Colores usados en pantallas previas
const COLORS = {
  title: '#a61e2a',    // rojo del título
  cardBg: '#1b1f2a',    // paneles oscuros
  headerBg: '#0e0f14',  // encabezado oscuro
}

const inputClasses = 'form-control bg-dark text-light border-secondary'
const inputTextClasses = 'input-group-text bg-dark text-muted border-secondary'

const CuentasPorPagar = () => {
  // UI state
  const [visible, setVisible] = useState(false)
  const [guardandoPago, setGuardandoPago] = useState(false)
  const [mostrarExito, setMostrarExito] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [filtro, setFiltro] = useState('')
  const [showReporte, setShowReporte] = useState(false)

  // Data state
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [seleccion, setSeleccion] = useState(null)

  // Pago state (modal)
  const [fechaPago, setFechaPago] = useState('')
  const [montoPago, setMontoPago] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [comentarios, setComentarios] = useState('')

  // Nueva CxP modal state
  const [showNueva, setShowNueva] = useState(false)
  const [guardandoCxP, setGuardandoCxP] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [nuevaProveedor, setNuevaProveedor] = useState('')
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaTotal, setNuevaTotal] = useState('')
  const [nuevaObs, setNuevaObs] = useState('')

  // Historial de pagos
  const [showHistorial, setShowHistorial] = useState(false)
  const [abonos, setAbonos] = useState([])
  const [cargandoAbonos, setCargandoAbonos] = useState(false)

  // Helpers
  const fmtLps = (n) =>
    new Intl.NumberFormat('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n || 0))

  const hoyISO = () => new Date().toISOString().slice(0, 10)

  const normalizarFila = (row) => {
    const proveedorNombre = row?.proveedor?.nombre || row?.proveedor?.nombres_proveedor || row?.proveedor || '-'
    const fecha = row?.fecha_compra || row?.fecha_emision || row?.fecha || row?.fechaCompra
    const total = Number(row?.total_compra ?? row?.total ?? 0)
    const saldo = row?.saldo != null ? Number(row.saldo) : (row?.pagado != null ? Number(total - Number(row.pagado)) : total)
    const pagado = Math.max(0, total - saldo)
    const estadoRaw = row?.estado || row?.estado_pago || (saldo <= 0 ? 'PAGADO' : 'PENDIENTE')
    const estado = String(estadoRaw).toUpperCase() === 'PAGADO' ? 'Pagado' : 'Pendiente'

    return {
      id: row?.id ?? row?.id_cuentasPagar ?? row?.id_cuenta ?? row?.id_cxp ?? 0,
      proveedor: proveedorNombre,
      fechaCompra: fecha ? new Date(fecha).toISOString().slice(0, 10) : '-',
      total,
      pagado,
      saldo,
      estado,
      _raw: row,
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setCargando(true)
      setError(null)
      try {
        const payload = await listarCxP()
        const arr = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.rows) ? payload.rows
            : (Array.isArray(payload?.data) ? payload.data
              : (Array.isArray(payload?.items) ? payload.items : [])))
        const normalizados = arr.map(normalizarFila)
        setCuentas(normalizados)
      } catch (err) {
        console.error('[CxP] listarCxP error:', err)
        setError(err?.message || 'No se pudieron cargar las cuentas por pagar')
      } finally {
        setCargando(false)
      }
    }
    fetchData()
  }, [])

  // Filtro por proveedor
  const cuentasFiltradas = useMemo(() => {
    const t = (filtro || '').trim().toLowerCase()
    if (!t) return cuentas
    return cuentas.filter((c) => (c.proveedor || '').toLowerCase().includes(t))
  }, [filtro, cuentas])

  // Columnas para el reporte
  const columnasReporte = [
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'fecha', label: 'Fecha de compra' },
    { key: 'total', label: 'Total (L.)' },
    { key: 'estado', label: 'Estado' },
  ]

  const datosReporte = useMemo(() => {
    return cuentasFiltradas.map((c) => ({
      proveedor: c.proveedor || '-',
      fecha: c.fechaCompra || '-',
      total: fmtLps(c.total || 0),
      estado: c.estado || '-',
    }))
  }, [cuentasFiltradas])

  const abrirModalPago = (row) => {
    setSeleccion(row)
    setFechaPago(hoyISO())
    setMontoPago(row?.saldo != null ? String(row.saldo) : '')
    setMetodoPago('')
    setComentarios('')
    setVisible(true)
  }

  const handleGuardarPago = async () => {
    if (!seleccion?.id) return
    const monto = Number(montoPago)
    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido.')
      return
    }
    if (monto > Number(seleccion.saldo || 0)) {
      alert('El monto no puede ser mayor que el saldo pendiente.')
      return
    }

    try {
      setGuardandoPago(true)
      await crearAbono(seleccion.id, {
        monto,
        fecha_pago: fechaPago,
        forma_pago: metodoPago || undefined,
        observacion: comentarios || undefined,
      })
      setVisible(false)
      setMensajeExito(`Se registró el pago por L. ${fmtLps(monto)} para ${seleccion.proveedor}.`)
      setMostrarExito(true)

      // Recargar lista
      setCargando(true)
      setError(null)
      const payload = await listarCxP()
      const arr = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.rows) ? payload.rows
          : (Array.isArray(payload?.data) ? payload.data
            : (Array.isArray(payload?.items) ? payload.items : [])))
      const normalizados = arr.map(normalizarFila)
      setCuentas(normalizados)
    } catch (err) {
      alert(err?.message || 'No se pudo registrar el pago.')
    } finally {
      setGuardandoPago(false)
      setCargando(false)
    }
  }

  // --- Nueva CxP ---
  const abrirNuevaCxP = async () => {
    setShowNueva(true)
    setNuevaFecha(hoyISO())
    setNuevaTotal('')
    setNuevaObs('')
    try {
      const provs = await listarProveedores()
      const opciones = Array.isArray(provs)
        ? provs
        : (Array.isArray(provs?.rows) ? provs.rows : (Array.isArray(provs?.data) ? provs.data : []))
      setProveedores(opciones || [])
      setNuevaProveedor(opciones?.[0]?.id_proveedor || opciones?.[0]?.id || '')
    } catch (e) {
      console.error('Error cargando proveedores:', e)
      setProveedores([])
      setNuevaProveedor('')
    }
  }

  const guardarNuevaCxP = async () => {
    const idProv = Number(nuevaProveedor)
    const total = Number(nuevaTotal)
    if (!idProv) return alert('Selecciona un proveedor.')
    if (!nuevaFecha) return alert('Selecciona la fecha de compra.')
    if (!total || total <= 0) return alert('Ingresa un total válido.')

    try {
      setGuardandoCxP(true)
      await crearCxP({
        id_proveedor: idProv,
        fecha_compra: nuevaFecha,
        total_compra: total,
        observacion: (nuevaObs || undefined),
      })
      setShowNueva(false)
      setMensajeExito('CxP creada correctamente.')
      setMostrarExito(true)

      // recargar lista
      setCargando(true)
      const payload = await listarCxP()
      const arr = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.rows) ? payload.rows
          : (Array.isArray(payload?.data) ? payload.data
            : (Array.isArray(payload?.items) ? payload.items : [])))
      const normalizados = arr.map(normalizarFila)
      setCuentas(normalizados)
    } catch (e) {
      alert(e?.message || 'No se pudo crear la CxP')
    } finally {
      setGuardandoCxP(false)
      setCargando(false)
    }
  }

  // --- Historial de pagos ---
  const abrirHistorial = async (row) => {
    setSeleccion(row)
    setShowHistorial(true)
    setCargandoAbonos(true)
    try {
      const pagos = await listarAbonos(row.id)
      const arr = Array.isArray(pagos) ? pagos
        : (Array.isArray(pagos?.rows) ? pagos.rows
          : (Array.isArray(pagos?.data) ? pagos.data
            : (Array.isArray(pagos?.items) ? pagos.items : (pagos?.abonos || []))))
      setAbonos(arr || [])
    } catch (e) {
      console.error('Error listando abonos:', e)
      setAbonos([])
    } finally {
      setCargandoAbonos(false)
    }
  }

  return (
    <CRow>
      <CCol>
        {/* Título */}
        <div className="mb-3">
          <h2 className="fw-bold" style={{ color: COLORS.title }}>Cuentas por Pagar</h2>
        </div>

        {/* Barra de búsqueda + acciones */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="input-group" style={{ maxWidth: 540 }}>
            <input
              type="text"
              className={inputClasses}
              placeholder="Buscar proveedor..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <span className={inputTextClasses}>
              <i className="bi bi-search"></i>
            </span>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowReporte(true)}
              disabled={cargando || cuentasFiltradas.length === 0}
            >
              Generar Reporte
            </button>
            <button
              className="btn btn-secondary"
              onClick={abrirNuevaCxP}
            >
              Agregar CxP
            </button>
          </div>
        </div>

        {/* Contenedor de la tabla (oscuro) */}
        <CCard className="mb-4 text-light border-0" style={{ borderRadius: 8, background: COLORS.cardBg }}>
          <CCardHeader
            className="d-flex align-items-center gap-2 border-0 text-light"
            style={{ background: COLORS.headerBg }}
          >
            <strong>Cuentas por Pagar</strong>
            {cargando && <CSpinner size="sm" />}
            {error && <span className="text-danger ms-2">{error}</span>}
          </CCardHeader>
          <CCardBody>
            <div className="table-responsive">
              <table className="table table-dark table-borderless align-middle mb-0">
                <thead className="text-muted">
                  <tr>
                    <th>Proveedor</th>
                    <th>Fecha de compra</th>
                    <th>Total a pagar</th>
                    <th>Monto pagado</th>
                    <th>Saldo pendiente</th>
                    <th>Estado de pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        {cargando ? 'Cargando...' : 'Sin resultados'}
                      </td>
                    </tr>
                  )}
                  {cuentasFiltradas.map((cuenta) => (
                    <tr key={cuenta.id}>
                      <td>{cuenta.proveedor}</td>
                      <td>{cuenta.fechaCompra}</td>
                      <td>L. {fmtLps(cuenta.total)}</td>
                      <td>L. {fmtLps(cuenta.pagado)}</td>
                      <td>L. {fmtLps(cuenta.saldo)}</td>
                      <td>
                        <span
                          className={`badge bg-${cuenta.estado === 'Pagado' ? 'success' : 'warning'}`}
                        >
                          {cuenta.estado}
                        </span>
                      </td>
                      <td className="d-flex gap-2">
                        <button
                          className="btn btn-outline-light btn-sm"
                          onClick={() => abrirHistorial(cuenta)}
                        >
                          Historial
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={cuenta.saldo <= 0}
                          onClick={() => abrirModalPago(cuenta)}
                        >
                          Registrar pago
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CCardBody>
        </CCard>

        {/* Modal de pago (oscuro) */}
        <CModal visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader className="bg-dark text-light border-secondary">
            <strong>Registrar pago</strong>
          </CModalHeader>
          <CModalBody className="bg-dark text-light">
            {seleccion && (
              <CForm>
                <div className="mb-3">
                  <CFormLabel>Proveedor</CFormLabel>
                  <CFormInput className={inputClasses} type="text" value={seleccion.proveedor} disabled />
                </div>
                <div className="mb-3">
                  <CFormLabel>Fecha del pago</CFormLabel>
                  <CFormInput className={inputClasses} type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
                </div>
                <div className="mb-3">
                  <CFormLabel>Monto a pagar</CFormLabel>
                  <CFormInput
                    className={inputClasses}
                    type="number"
                    min="0"
                    step="0.01"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                  />
                  <small className="text-muted">Saldo pendiente: L. {fmtLps(seleccion.saldo)}</small>
                </div>
                <div className="mb-3">
                  <CFormLabel>Método de pago (opcional)</CFormLabel>
                  <CFormInput className={inputClasses} type="text" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} />
                </div>
                <div className="mb-3">
                  <CFormLabel>Comentarios (opcional)</CFormLabel>
                  <CFormInput className={inputClasses} type="text" value={comentarios} onChange={(e) => setComentarios(e.target.value)} />
                </div>
              </CForm>
            )}
          </CModalBody>
          <CModalFooter className="bg-dark border-secondary">
            <CButton color="secondary" onClick={() => setVisible(false)}>
              Cancelar
            </CButton>
            <CButton color="primary" onClick={handleGuardarPago} disabled={guardandoPago}>
              {guardandoPago ? (<><CSpinner size="sm" className="me-2" />Guardando...</>) : 'Guardar pago'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal Nueva CxP (oscuro) */}
        <CModal visible={showNueva} onClose={() => setShowNueva(false)}>
          <CModalHeader className="bg-dark text-light border-secondary">
            <strong>Nueva Cuenta por Pagar</strong>
          </CModalHeader>
          <CModalBody className="bg-dark text-light">
            <CForm>
              <div className="mb-3">
                <CFormLabel>Proveedor</CFormLabel>
                <CFormSelect className="bg-dark text-light border-secondary" value={nuevaProveedor} onChange={(e) => setNuevaProveedor(e.target.value)}>
                  <option value="">Seleccione...</option>
                  {proveedores.map((p) => (
                    <option key={p.id_proveedor || p.id} value={p.id_proveedor || p.id}>
                      {p.nombres_proveedor || p.nombre || `#${p.id_proveedor || p.id}`}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>Fecha de compra</CFormLabel>
                <CFormInput className={inputClasses} type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
              </div>
              <div className="mb-3">
                <CFormLabel>Total de la compra</CFormLabel>
                <CFormInput
                  className={inputClasses}
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevaTotal}
                  onChange={(e) => setNuevaTotal(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Observación (opcional)</CFormLabel>
                <CFormInput className={inputClasses} type="text" value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} />
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter className="bg-dark border-secondary">
            <CButton color="secondary" onClick={() => setShowNueva(false)}>
              Cancelar
            </CButton>
            <CButton color="primary" onClick={guardarNuevaCxP} disabled={guardandoCxP}>
              {guardandoCxP ? (<><CSpinner size="sm" className="me-2" />Guardando...</>) : 'Crear CxP'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal Historial de pagos (oscuro) */}
        <CModal visible={showHistorial} onClose={() => setShowHistorial(false)}>
          <CModalHeader className="bg-dark text-light border-secondary">
            <strong>Historial de pagos</strong>
          </CModalHeader>
          <CModalBody className="bg-dark text-light">
            {cargandoAbonos ? (
              <div className="d-flex align-items-center gap-2"><CSpinner size="sm" /> Cargando...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-borderless align-middle mb-0">
                  <thead className="text-muted">
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Forma de pago</th>
                      <th>Referencia/Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!abonos || abonos.length === 0) ? (
                      <tr><td colSpan="4" className="text-center text-muted">Sin pagos registrados</td></tr>
                    ) : abonos.map((a, idx) => (
                      <tr key={idx}>
                        <td>{(a.fecha_pago || a.fecha || '').toString().slice(0,10)}</td>
                        <td>L. {fmtLps(a.monto_pago || a.monto || 0)}</td>
                        <td>{a.forma_pago || '-'}</td>
                        <td>{a.referencia || a.observacion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CModalBody>
          <CModalFooter className="bg-dark border-secondary">
            <CButton color="primary" onClick={() => setShowHistorial(false)}>
              Cerrar
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Modal de éxito */}
        <CModal visible={mostrarExito} onClose={() => setMostrarExito(false)} centered>
          <CModalHeader className="bg-dark text-light border-secondary">¡Operación exitosa!</CModalHeader>
          <CModalBody className="bg-dark text-light">
            {mensajeExito || 'Acción realizada correctamente.'}
          </CModalBody>
          <CModalFooter className="bg-dark border-secondary">
            <CButton color="primary" onClick={() => setMostrarExito(false)}>Aceptar</CButton>
          </CModalFooter>
        </CModal>

        {/* Reporte (reutilizable) */}
        <ReporteModal
          show={showReporte}
          onClose={() => setShowReporte(false)}
          titulo="Cuentas por Pagar"
          columnas={columnasReporte}
          datos={datosReporte}
        />
      </CCol>
    </CRow>
  )
}

export default CuentasPorPagar
