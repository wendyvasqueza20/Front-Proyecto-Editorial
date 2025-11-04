// src/views/Inventario/InventarioGeneral.js

import React, { useState, useEffect } from 'react'
import axios from 'axios' // Asegúrate de haberlo instalado (npm install axios)
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

function InventarioGeneral() {
  const [inventario, setInventario] = useState([])
  const [formState, setFormState] = useState({
    id_inventario: null,
    ISBN: '',
    existencias_actuales: '',
    ubicacion_libro: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  // MODIFICADO: Esta es tu URL de la API
  const API_URL = 'http://localhost:5000/api/inventario-general'

  // Función para obtener los datos de la API
  const fetchInventario = async () => {
    try {
      const response = await axios.get(API_URL)
      setInventario(response.data)
    } catch (error) {
      console.error('Error al obtener los datos del inventario:', error)
      alert('No se pudieron cargar los registros. Revisa que tu servidor backend esté funcionando.')
    }
  }

  // Usamos useEffect para llamar a fetchInventario cuando el componente se monta
  useEffect(() => {
    fetchInventario()
  }, [])

  // Manejador de cambios para el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prevFormState) => ({ ...prevFormState, [name]: value }))
  }

  // Manejador del envío del formulario (para crear y actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const newRecord = {
      ...formState,
      ISBN: parseInt(formState.ISBN),
      existencias_actuales: parseInt(formState.existencias_actuales),
    }

    try {
      if (isEdit) {
        // Lógica de ACTUALIZACIÓN (PUT)
        await axios.put(`${API_URL}/${newRecord.id_inventario}`, newRecord)
        alert('Registro actualizado exitosamente.')
      } else {
        // Lógica de CREACIÓN (POST)
        const { id_inventario, ...recordToCreate } = newRecord // La API debe generar el ID
        await axios.post(API_URL, recordToCreate)
        alert('Registro agregado exitosamente.')
      }

      fetchInventario() // Recargamos la tabla
      setVisible(false)
      limpiarFormulario()
    } catch (error) {
      console.error('Error al guardar el registro:', error)
      alert('Ocurrió un error al guardar. Por favor, inténtelo de nuevo.')
    }
  }

  // Limpiar los campos del formulario
  const limpiarFormulario = () => {
    setFormState({
      id_inventario: null,
      ISBN: '',
      existencias_actuales: '',
      ubicacion_libro: '',
    })
    setIsEdit(false)
  }

  // Abrir modal para nuevo registro
  const abrirModalNuevo = () => {
    limpiarFormulario()
    setIsEdit(false)
    setVisible(true)
  }

  // Abrir modal para editar registro
  const abrirModalEditar = (item) => {
    setFormState({ ...item })
    setIsEdit(true)
    setVisible(true)
  }

  // Eliminar un registro
  const eliminarRegistro = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      try {
        await axios.delete(`${API_URL}/${id}`)
        alert('Registro eliminado correctamente.')
        fetchInventario() // Recargamos la tabla
      } catch (error) {
        console.error('Error al eliminar el registro:', error)
        alert('No se pudo eliminar el registro. Inténtelo de nuevo.')
      }
    }
  }

  // Filtrar la tabla de inventario
  const inventarioFiltrado = inventario.filter(
    (item) =>
      (item.ISBN?.toString() ?? '').includes(searchTerm) ||
      (item.ubicacion_libro?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (item.existencias_actuales?.toString() ?? '').includes(searchTerm),
  )

  // Las funciones para generar reportes no cambian
  const generarReporteExcel = () => {
    if (window.confirm('¿Desea generar el reporte en formato Excel?')) {
      const dataToExport = inventarioFiltrado.map(
        ({ id_inventario, ISBN, existencias_actuales, ubicacion_libro }) => ({
          'ID Inventario': id_inventario,
          ISBN: ISBN,
          Existencias: existencias_actuales,
          Ubicación: ubicacion_libro,
        }),
      )

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario General')
      XLSX.writeFile(workbook, 'reporte_inventario_general.xlsx')
      alert(
        'Reporte generado y descargado exitosamente. Nota: El archivo de Excel no contiene el logo ni los títulos del reporte, debe agregarlos manualmente.',
      )
    }
  }

  const generarReportePDF = () => {
    window.print()
  }

  return (
    <CCard className="shadow-sm p-3 mb-5 bg-white rounded print-container">
      {/* El resto del código JSX es exactamente el mismo que ya tenías */}
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
        .btn-warning-custom { background-color: #d1b899; border-color: #d1b899; color: #000; }
        .btn-warning-custom:hover { background-color: #c0a88a; border-color: #c0a88a; }
        .btn-danger-custom { background-color: #dc3545; border-color: #dc3545; color: #fff; }
        .btn-danger-custom:hover { background-color: #c82333; border-color: #c82333; }
      `}</style>
      <CCardHeader className="border-0 bg-light no-print">
        <h4 className="mb-0">Gestión de Inventario General</h4>
      </CCardHeader>
      <CCardBody>
        <div className="logo-print">
          <img src="logo_guaymuras1.jpg" alt="Logo de la Editorial Guaymuras" />
          <h1>Editorial Guaymuras</h1>
          <h2>Reporte de Inventario General</h2>
        </div>
        <CRow className="mb-3 g-3 no-print align-items-center">
          <CCol md={4}>
            <CFormInput
              type="text"
              placeholder="Buscar por ISBN, Ubicación o Existencias..."
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
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">ISBN</CTableHeaderCell>
              <CTableHeaderCell scope="col">Existencias</CTableHeaderCell>
              <CTableHeaderCell scope="col">Ubicación</CTableHeaderCell>
              <CTableHeaderCell scope="col" className="no-print">
                Acciones
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {inventarioFiltrado.map((item) => (
              <CTableRow key={item.id_inventario}>
                <CTableDataCell>{item.id_inventario}</CTableDataCell>
                <CTableDataCell>{item.ISBN}</CTableDataCell>
                <CTableDataCell>{item.existencias_actuales}</CTableDataCell>
                <CTableDataCell>{item.ubicacion_libro}</CTableDataCell>
                <CTableDataCell className="no-print">
                  <CButton
                    className="me-2 text-white btn-warning-custom"
                    onClick={() => abrirModalEditar(item)}
                  >
                    Editar
                  </CButton>
                  <CButton
                    className="btn-danger-custom"
                    onClick={() => eliminarRegistro(item.id_inventario)}
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
            <CFormInput type="hidden" name="id_inventario" value={formState.id_inventario || ''} />
            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="ISBN">ISBN</CFormLabel>
                <CFormInput
                  type="number"
                  name="ISBN"
                  value={formState.ISBN}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="existencias_actuales">Existencias Actuales</CFormLabel>
                <CFormInput
                  type="number"
                  name="existencias_actuales"
                  value={formState.existencias_actuales}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol>
                <CFormLabel htmlFor="ubicacion_libro">Ubicación</CFormLabel>
                <CFormInput
                  type="text"
                  name="ubicacion_libro"
                  value={formState.ubicacion_libro}
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

export default InventarioGeneral
