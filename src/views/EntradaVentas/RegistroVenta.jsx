
// src/views/EntradaVentas/RegistroVenta.jsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  Modal,
  Button,
  Form,
  Table,
  Row,
  Col,
  InputGroup
} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import GenerarFactura from './GenerarFactura'
import ReporteModal from '../../components/Reportes/ReporteModal'

const RegistroVenta = () => {
  const [show, setShow] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [indiceEditar, setIndiceEditar] = useState(null)
  const [busquedaCliente] = useState('')
  const [filtro, setFiltro] = useState('')
  const [ventasRegistradas, setVentasRegistradas] = useState([])
  const [showModalEliminar, setShowModalEliminar] = useState(false)
  const [indexAEliminar, setIndexAEliminar] = useState(null)
  const [showModalExito, setShowModalExito] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [showReporte, setShowReporte] = useState(false)

  const [venta, setVenta] = useState({
    cliente: '',
    noFactura: '',
    fecha: '',
    tipoVenta: '',
    tipoPago: '',
    estadoFactura: 'Pendiente',
    subtotal: 0,
    descuento: 0,
    impuesto: 0,
    total: 0,
    pdfURL: null
  })

  const [productos, setProductos] = useState([
    { id: Date.now(), libro: '', cantidad: 1, precio: 0 }
  ])

  useEffect(() => {
    const datosGuardados = localStorage.getItem('ventasRegistradas')
    if (datosGuardados) {
      setVentasRegistradas(JSON.parse(datosGuardados))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('ventasRegistradas', JSON.stringify(ventasRegistradas))
  }, [ventasRegistradas])

  useEffect(() => {
    calcularTotales()
  }, [productos, venta.descuento])

  const handleChange = (e) => {
    const { name, value } = e.target
    let nuevosDatos = { ...venta, [name]: value }

    if (name === "tipoVenta") {
      const tipo = value.toLowerCase();
      if (value === "Devolución") {
        nuevosDatos.estadoFactura = "Anulada";
      } else if (value === "Cotización") {
        nuevosDatos.estadoFactura = "Pendiente";
      } else if (tipo === "normal") {
        nuevosDatos.estadoFactura = "Emitida";
      } else {
        nuevosDatos.estadoFactura = "";
      }
    }
    setVenta(nuevosDatos)
  }

  const handleProductoChange = (id, campo, valor) => {
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, [campo]: valor } : prod
      )
    )
  }

  const agregarProducto = () => {
    setProductos([...productos, { id: Date.now(), libro: '', cantidad: 1, precio: 0 }])
  }

  const eliminarProducto = (id) => {
    if (productos.length === 1) return
    setProductos(productos.filter((p) => p.id !== id))
  }

  const calcularTotales = () => {
    const subtotal = productos.reduce(
      (acc, p) => acc + (Number(p.precio) || 0) * (Number(p.cantidad) || 0),
      0
    )
    const descuento = Number(venta.descuento) || 0
    const impuesto = (subtotal - descuento) * 0.15
    const total = subtotal - descuento + impuesto

    setVenta((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      impuesto: impuesto.toFixed(2),
      total: total.toFixed(2)
    }))
  }

  const guardarVenta = (e) => {
    e.preventDefault()
    const nuevaVenta = { ...venta, productos }

    if (modoEdicion) {
      const copia = [...ventasRegistradas]
      copia[indiceEditar] = { ...nuevaVenta, estadoFactura: 'Pendiente', pdfURL: null }
      setVentasRegistradas(copia)
    } else {
      setVentasRegistradas([...ventasRegistradas, nuevaVenta])
    }
    
    setShow(false)
    setModoEdicion(false);
    setIndiceEditar(null);        
    setShowModalExito(true);

    setVenta({
      cliente: '',
      noFactura: '',
      fecha: '',
      tipoVenta: '',
      tipoPago: '',
      estadoFactura: 'Pendiente',
      subtotal: 0,
      descuento: 0,
      impuesto: 0,
      total: 0,
      pdfURL: null
    })
    setProductos([{ id: Date.now(), libro: '', cantidad: 1, precio: 0 }])
  }

  const handleEditar = (index) => {
    const venta = ventasRegistradas[index]
    setVenta(venta)
    setProductos(venta.productos)
    setModoEdicion(true)
    setIndiceEditar(index)
    setShow(true)
  }

  const confirmarEliminar = () => {
    const copia = [...ventasRegistradas]
    copia.splice(indexAEliminar, 1)
    setVentasRegistradas(copia)
    setShowModalEliminar(false)
    setIndexAEliminar(null)
  }

  const handleSearchClient = () => {
    console.log('Buscar cliente:', busquedaCliente)
  }

  const ventasFiltradas = useMemo(() => {
    return ventasRegistradas.filter((venta) =>
      venta.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
      venta.noFactura.toLowerCase().includes(filtro.toLowerCase())
    )
  }, [ventasRegistradas, filtro])

  const columnasReporte = [
    { key: 'noFactura', label: 'No. Factura' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'tipoVenta', label: 'Tipo de Venta' },
    { key: 'estadoFactura', label: 'Estado' },
    { key: 'total', label: 'Total (Lps.)' },
  ]

  const datosReporte = useMemo(() => {
    return ventasFiltradas.map((v) => ({
      noFactura: v.noFactura || '-',
      cliente: v.cliente || '-',
      fecha: v.fecha || '-',
      tipoVenta: v.tipoVenta || '-',
      estadoFactura: v.estadoFactura || '-',
      total: v.total 
    }))
  }, [ventasFiltradas])

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h4 className="fw-bold" style={{ color: '#8a2c31' }}>
          Historial de Ventas
        </h4>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
        </div>

        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => setShow(true)}>
            🛒 Crear Venta
          </Button>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowReporte(true)}
          >
            <i className="bi bi-file-earmark-pdf-fill me-2"></i>
            Generar Reporte
          </button>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>N° Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Tipo de Venta</th>
            <th>Tipo de Pago</th>
            <th>Estado Factura</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventasRegistradas.length > 0 ? (
            ventasFiltradas.map((v, i) => (
              <tr key={i}>
                <td>{v.noFactura}</td>
                <td>{v.cliente}</td>
                <td>{v.fecha}</td>
                <td>{v.tipoVenta}</td>
                <td>{v.tipoPago}</td>
                <td>{v.estadoFactura}</td>
                <td>L {v.total}</td>
                <td>
                  <Button size="sm" className="me-1" onClick={() => handleEditar(i)}>
                    Editar
                  </Button>
                  <GenerarFactura 
                    venta={v} 
                    index={i}
                    ventasRegistradas={ventasRegistradas}
                    setVentasRegistradas={setVentasRegistradas}
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setShowModalEliminar(true)
                      setIndexAEliminar(i)
                    }}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No hay ventas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal Registro Venta */}
      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? '✏️ Editar Venta' : '🛒 Nueva Venta'}</Modal.Title>
        </Modal.Header>
        
        <div className="px-4 pt-2">
          <Link to="/clientes/registrar" className="text-decoration-none text-primary">
            👤 Registrar nuevo cliente
          </Link>
        </div>

        <Modal.Body>         
          <Form onSubmit={guardarVenta}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Cliente</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Buscar cliente..."
                    name="cliente"
                    value={venta.cliente}
                    onChange={handleChange}
                    required
                  />
                  <Button variant="secondary" onClick={handleSearchClient}>
                    🔍
                  </Button>
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={venta.fecha}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Label>No. Factura</Form.Label>
                <Form.Control
                  type="text"
                  name="noFactura"
                  value={venta.noFactura}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Detalles del Producto</strong>
              <Button variant="primary" size="sm" onClick={agregarProducto}>
                ➕ Agregar Producto
              </Button>
            </div>

            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Libro</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Form.Control
                        type="text"
                        value={p.libro}
                        onChange={(e) => handleProductoChange(p.id, 'libro', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="1"
                        value={p.cantidad || 1}
                        onChange={(e) =>
                          handleProductoChange(p.id, 'cantidad', parseInt(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        step="any"
                        value={p.precio}
                        onChange={(e) =>
                          handleProductoChange(p.id, 'precio', parseFloat(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarProducto(p.id)}
                        disabled={productos.length <= 1}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Tipo de Venta</Form.Label>
                <Form.Select
                  name="tipoVenta"
                  value={venta.tipoVenta}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  <option value="Normal">Normal</option>
                  <option value="Cotización">Cotización</option>
                  <option value="Devolución">Devolución</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label>Tipo de Pago</Form.Label>
                <Form.Select
                  name="tipoPago"
                  value={venta.tipoPago}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia - Banco Atlántida</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label>Estado Factura</Form.Label>
                <Form.Control 
                  name="estadoFactura" 
                  value={venta.estadoFactura} 
                  readOnly 
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Subtotal</Form.Label>
                <Form.Control name="subtotal" value={venta.subtotal} readOnly />
              </Col>
              <Col md={4}>
                <Form.Label>Descuento</Form.Label>
                <Form.Control
                  name="descuento"
                  value={venta.descuento}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Impuesto (15%)</Form.Label>
                <Form.Control name="impuesto" value={venta.impuesto} readOnly />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Total</Form.Label>
                <Form.Control name="total" value={venta.total} readOnly />
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShow(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {modoEdicion ? 'Guardar cambios' : 'Guardar venta'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de éxito */}
      <Modal show={showModalExito} onHide={() => setShowModalExito(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¡Éxito!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modoEdicion ? '✅ Cambios guardados correctamente.' : '✅ Venta registrada correctamente.'}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModalExito(false)}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal eliminar */}
      <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar esta venta?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reporte (reutilizable) */}
      <ReporteModal
        show={showReporte}
        onClose={() => setShowReporte(false)}
        titulo="Reporte de Ventas"
        columnas={columnasReporte}
        datos={datosReporte}
      />
    </div>
  )
}

export default RegistroVenta