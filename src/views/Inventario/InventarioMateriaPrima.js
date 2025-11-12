// src/views/Inventario/InventarioMateriaPrima.js

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormLabel,
} from '@coreui/react'
import * as XLSX from 'xlsx'

function InventarioMateriaPrima() {
  const [inventario, setInventario] = useState([])
  const [formState, setFormState] = useState({
    id_inventarioMP: null,
    id_materiaPrima: '',
    nombre_articulo: '',
    cantidad: '',
    ubicacion_almacen: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const API_URL = 'http://localhost:5000/api/inventario-mp'

  const fetchInventario = async () => {
    try {
      const response = await axios.get(API_URL)
      setInventario(response.data)
    } catch (error) {
      console.error('Error al cargar el inventario:', error)
      alert('No se pudo cargar el inventario desde la API.')
    }
  }

  useEffect(() => {
    fetchInventario()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prevFormState) => ({ ...prevFormState, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newRecord = {
      ...formState,
      id_materiaPrima: parseInt(formState.id_materiaPrima),
      cantidad: parseInt(formState.cantidad),
    }

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/${newRecord.id_inventarioMP}`, newRecord)
        alert('Registro actualizado exitosamente.')
      } else {
        await axios.post(API_URL, newRecord)
        alert('Registro agregado exitosamente.')
      }
      fetchInventario()
    } catch (error) {
      console.error('Error al guardar el registro:', error)
      alert('Hubo un error al guardar el registro.')
    }

    limpiarFormulario()
    setVisible(false)
  }

  const limpiarFormulario = () => {
    setFormState({
      id_inventarioMP: null,
      id_materiaPrima: '',
      nombre_articulo: '',
      cantidad: '',
      ubicacion_almacen: '',
    })
    setIsEdit(false)
  }

  const abrirModalNuevo = () => {
    limpiarFormulario()
    setIsEdit(false)
    setVisible(true)
  }

  const abrirModalEditar = (item) => {
    setFormState({ ...item })
    setIsEdit(true)
    setVisible(true)
  }

  const eliminarRegistro = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      try {
        await axios.delete(`${API_URL}/${id}`)
        setInventario(inventario.filter((item) => item.id_inventarioMP !== id))
        alert('Registro eliminado correctamente.')
      } catch (error) {
        console.error('Error al eliminar el registro:', error)
        alert('Hubo un error al eliminar el registro.')
      }
    }
  }

  const inventarioFiltrado = inventario.filter(
    (item) =>
      (item.nombre_articulo?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (item.ubicacion_almacen?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (item.id_materiaPrima?.toString() ?? '').includes(searchTerm),
  )

  const generarReporteExcel = () => {
    if (window.confirm('¿Desea generar el reporte en formato Excel?')) {
      const dataToExport = inventarioFiltrado.map(
        ({ id_inventarioMP, id_materiaPrima, nombre_articulo, cantidad, ubicacion_almacen }) => ({
          'ID Inv. MP': id_inventarioMP,
          'ID MP': id_materiaPrima,
          'Nombre Artículo': nombre_articulo,
          Cantidad: cantidad,
          'Ubicación Almacén': ubicacion_almacen,
        }),
      )

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario Materia Prima')
      XLSX.writeFile(workbook, 'reporte_inventario_materia_prima.xlsx')
      alert('Reporte generado y descargado exitosamente.')
    }
  }

  const generarReportePDF = () => {
    window.print()
  }

  return (
    <CCard className="shadow-sm p-3 mb-5 bg-white rounded print-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; }
          .card-header, .card-body { padding: 0 !important; }
          .logo-print {
            display: flex !important;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .logo-print img { width: 150px; margin-bottom: 10px; }
          .logo-print h1 { margin: 0; font-size: 24px; }
          .logo-print h2 { margin: 5px 0 0; font-size: 18px; color: #555; }
        }
        .logo-print { display: none; }

        /* --- CÓDIGO CORREGIDO Y AÑADIDO --- */
        .btn-warning-custom {
          background-color: #d1b899; /* Tono beige */
          border-color: #d1b899;
          color: #333333; /* Color de texto oscuro para mejor contraste */
        }

        .btn-warning-custom:hover {
          background-color: #c0a88a;
          border-color: #c0a88a;
          color: #000000; /* Texto negro al pasar el mouse */
        }
        /* --- FIN DEL CÓDIGO AÑADIDO --- */

        .btn-danger-custom {
          background-color: #dc3545;
          border-color: #dc3545;
          color: #fff;
        }

        .btn-danger-custom:hover {
          background-color: #c82333;
          border-color: #c82333;
        }
      `}</style>
      <CCardHeader className="border-0 bg-light no-print">
        <h4 className="mb-0">Gestión de Inventario de Materia Prima</h4>
      </CCardHeader>
      <CCardBody>
        <div className="logo-print">{/* ... contenido del logo ... */}</div>
        <CRow className="mb-3 g-3 no-print align-items-center">
          <CCol md={4}>
            <CFormInput
              type="text"
              placeholder="Buscar por ID, nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCol>
          <CCol md={8} className="d-flex justify-content-end">
            <CButton color="success" className="me-2 text-white" onClick={generarReporteExcel}>
              Generar Reporte Excel
            </CButton>
            <CButton color="info" className="me-2" onClick={generarReportePDF}>
              Generar Reporte PDF
            </CButton>
            <CButton color="primary" onClick={abrirModalNuevo}>
              Agregar Registro
            </CButton>
          </CCol>
        </CRow>
        <CTable responsive striped hover className="shadow-sm">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">ID Inv. MP</CTableHeaderCell>
              <CTableHeaderCell scope="col">ID MP</CTableHeaderCell>
              <CTableHeaderCell scope="col">Nombre Artículo</CTableHeaderCell>
              <CTableHeaderCell scope="col">Cantidad</CTableHeaderCell>
              <CTableHeaderCell scope="col">Ubicación Almacén</CTableHeaderCell>
              <CTableHeaderCell scope="col" className="no-print">
                Acciones
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {inventarioFiltrado.map((item) => (
              <CTableRow key={item.id_inventarioMP}>
                <CTableDataCell>{item.id_inventarioMP}</CTableDataCell>
                <CTableDataCell>{item.id_materiaPrima}</CTableDataCell>
                <CTableDataCell>{item.nombre_articulo}</CTableDataCell>
                <CTableDataCell>{item.cantidad}</CTableDataCell>
                <CTableDataCell>{item.ubicacion_almacen}</CTableDataCell>
                <CTableDataCell className="no-print">
                  {/* --- CAMBIO: Eliminado 'text-white' para que use el color del CSS --- */}
                  <CButton
                    className="me-2 btn-warning-custom"
                    onClick={() => abrirModalEditar(item)}
                  >
                    Editar
                  </CButton>
                  <CButton
                    className="btn-danger-custom"
                    onClick={() => eliminarRegistro(item.id_inventarioMP)}
                  >
                    Eliminar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Editar Registro' : 'Agregar Nuevo Registro'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CFormInput
              type="hidden"
              name="id_inventarioMP"
              value={formState.id_inventarioMP || ''}
            />
            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="id_materiaPrima">ID Materia Prima</CFormLabel>
                <CFormInput
                  type="number"
                  name="id_materiaPrima"
                  value={formState.id_materiaPrima}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol>
                <CFormLabel htmlFor="nombre_articulo">Nombre Artículo</CFormLabel>
                <CFormInput
                  type="text"
                  name="nombre_articulo"
                  value={formState.nombre_articulo}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="cantidad">Cantidad</CFormLabel>
                <CFormInput
                  type="number"
                  name="cantidad"
                  value={formState.cantidad}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol>
                <CFormLabel htmlFor="ubicacion_almacen">Ubicación en Almacén</CFormLabel>
                <CFormInput
                  type="text"
                  name="ubicacion_almacen"
                  value={formState.ubicacion_almacen}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton type="submit" color="primary">
              {isEdit ? 'Actualizar' : 'Guardar'}
            </CButton>
            <CButton color="secondary" onClick={() => setVisible(false)}>
              Cancelar
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CCard>
  )
}

export default InventarioMateriaPrima
