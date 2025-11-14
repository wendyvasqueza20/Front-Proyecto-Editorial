// src/views/Inventario/InventarioEnProceso.js

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

// Componente para la gestión de inventario en proceso
function InventarioEnProceso() {
  const [inventario, setInventario] = useState([])
  const [formState, setFormState] = useState({
    id_inventarioProceso: null,
    id_materiaPrima: '',
    id_fase: '',
    cantidad_actualProceso: '',
    costo_unitarioProceso: '',
    unidades_proceso: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const API_URL = 'http://localhost:5000/api/inventario-proceso'

  const fetchInventario = async () => {
    try {
      const response = await axios.get(API_URL)
      setInventario(response.data)
    } catch (error) {
      console.error('Error al obtener los datos del inventario:', error)
      alert('No se pudieron cargar los datos. Revisa la conexión con la API.')
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
    const recordData = {
      id_materiaPrima: parseInt(formState.id_materiaPrima),
      id_fase: parseInt(formState.id_fase),
      cantidad_actualProceso: parseFloat(formState.cantidad_actualProceso),
      costo_unitarioProceso: parseFloat(formState.costo_unitarioProceso),
      unidades_proceso: parseInt(formState.unidades_proceso),
    }

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/${formState.id_inventarioProceso}`, recordData)
        alert('Registro actualizado exitosamente.')
      } else {
        await axios.post(API_URL, recordData)
        alert('Registro agregado exitosamente.')
      }
      fetchInventario()
      setVisible(false)
      limpiarFormulario()
    } catch (error) {
      console.error('Error al guardar el registro:', error)
      alert('Ocurrió un error al guardar el registro.')
    }
  }

  const limpiarFormulario = () => {
    setFormState({
      id_inventarioProceso: null,
      id_materiaPrima: '',
      id_fase: '',
      cantidad_actualProceso: '',
      costo_unitarioProceso: '',
      unidades_proceso: '',
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
        alert('Registro eliminado correctamente.')
        fetchInventario()
      } catch (error) {
        console.error('Error al eliminar el registro:', error)
        alert('Ocurrió un error al eliminar el registro.')
      }
    }
  }

  const inventarioFiltrado = inventario.filter(
    (item) =>
      (item.id_materiaPrima?.toString() || '').includes(searchTerm.toLowerCase()) ||
      (item.id_fase?.toString() || '').includes(searchTerm.toLowerCase()) ||
      (item.unidades_proceso?.toString() || '').includes(searchTerm.toLowerCase()),
  )

  const generarReporteExcel = () => {
    /* ... tu código de Excel sin cambios ... */
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
        .btn-warning-custom {
          background-color: #d1b899 !important; /* Tono beige */
          border-color: #d1b899 !important;
          color: #000 !important;
        }
        .btn-warning-custom:hover {
          background-color: #c0a88a !important;
          border-color: #c0a88a !important;
        }
        .btn-danger-custom {
          background-color: #dc3545 !important; /* Tono rojo */
          border-color: #dc3545 !important;
          color: #fff !important;
        }
        .btn-danger-custom:hover {
          background-color: #c82333 !important;
          border-color: #c82333 !important;
        }
      `}</style>
      <CCardHeader className="border-0 bg-light no-print">
        <h4 className="mb-0">Gestión de Inventario en Proceso</h4>
      </CCardHeader>
      <CCardBody>
        <div className="logo-print">
          <img src="logo_guaymuras1.jpg" alt="Logo de la Editorial Guaymuras" />
          <h1>Editorial Guaymuras</h1>
          <h2>Reporte de Inventario en Proceso</h2>
        </div>
        <CRow className="mb-3 g-3 no-print align-items-center">
          <CCol md={4}>
            <CFormInput
              type="text"
              placeholder="Buscar por ID Materia Prima, ID Fase o Unidades..."
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
              <CTableHeaderCell scope="col">ID Proceso</CTableHeaderCell>
              <CTableHeaderCell scope="col">ID Materia Prima</CTableHeaderCell>
              <CTableHeaderCell scope="col">ID Fase</CTableHeaderCell>
              <CTableHeaderCell scope="col">Cantidad</CTableHeaderCell>
              <CTableHeaderCell scope="col">Costo Unitario</CTableHeaderCell>
              <CTableHeaderCell scope="col">Unidades</CTableHeaderCell>
              <CTableHeaderCell scope="col">Fecha Actualización</CTableHeaderCell>
              <CTableHeaderCell scope="col" className="no-print">
                Acciones
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {inventarioFiltrado.map((item) => (
              <CTableRow key={item.id_inventarioProceso}>
                <CTableDataCell>{item.id_inventarioProceso}</CTableDataCell>
                <CTableDataCell>{item.id_materiaPrima}</CTableDataCell>
                <CTableDataCell>{item.id_fase}</CTableDataCell>
                <CTableDataCell>{item.cantidad_actualProceso}</CTableDataCell>
                <CTableDataCell>
                  L. {(parseFloat(item.costo_unitarioProceso) || 0).toFixed(2)}
                </CTableDataCell>
                <CTableDataCell>{item.unidades_proceso}</CTableDataCell>
                <CTableDataCell>{item.fecha_ultimaActualizacion}</CTableDataCell>
                <CTableDataCell className="no-print">
                  {/* ✅ BOTONES CORREGIDOS */}
                  <CButton
                    color="warning"
                    className="me-2 btn-warning-custom"
                    onClick={() => abrirModalEditar(item)}
                  >
                    Editar
                  </CButton>
                  <CButton
                    color="danger"
                    className="btn-danger-custom"
                    onClick={() => eliminarRegistro(item.id_inventarioProceso)}
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
              name="id_inventarioProceso"
              value={formState.id_inventarioProceso || ''}
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
                <CFormLabel htmlFor="id_fase">ID Fase</CFormLabel>
                <CFormInput
                  type="number"
                  name="id_fase"
                  value={formState.id_fase}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="cantidad_actualProceso">Cantidad Actual en Proceso</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  name="cantidad_actualProceso"
                  value={formState.cantidad_actualProceso}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol>
                <CFormLabel htmlFor="costo_unitarioProceso">Costo Unitario</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  name="costo_unitarioProceso"
                  value={formState.costo_unitarioProceso}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="unidades_proceso">Unidades en Proceso</CFormLabel>
                <CFormInput
                  type="number"
                  name="unidades_proceso"
                  value={formState.unidades_proceso}
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

export default InventarioEnProceso