// ¡MODIFICADO! - Se importa useCallback
import React, { useState, useEffect, useCallback } from 'react'
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

  // --- ¡NUEVOS ESTADOS PARA LOS MODALES! ---
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  // --- FIN DE NUEVOS ESTADOS ---

  const API_URL = 'http://localhost:5000/api/inventario-mp'

  // --- ¡NUEVAS FUNCIONES DE MODALES AUXILIARES! ---
  const abrirModalAlert = useCallback((mensaje) => {
    setAlertMessage(mensaje)
    setAlertVisible(true)
  }, [])

  const abrirModalConfirm = useCallback((mensaje, accion) => {
    setConfirmMessage(mensaje)
    setConfirmAction(() => () => accion())
    setConfirmVisible(true)
  }, [])

  const onConfirm = useCallback(() => {
    if (confirmAction) {
      confirmAction()
    }
    setConfirmVisible(false)
    setConfirmAction(null)
  }, [confirmAction])
  // --- FIN DE FUNCIONES AUXILIARES ---

  const fetchInventario = useCallback(async () => {
    try {
      const response = await axios.get(API_URL)
      setInventario(response.data)
    } catch (error) {
      console.error('Error al cargar el inventario:', error)
      // ¡MODIFICADO! - Se usa el modal y sin acentos
      abrirModalAlert('No se pudo cargar el inventario desde la API.')
    }
  }, [abrirModalAlert])

  useEffect(() => {
    fetchInventario()
  }, [fetchInventario])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormState((prevFormState) => ({ ...prevFormState, [name]: value }))
  }, [])

  const limpiarFormulario = useCallback(() => {
    setFormState({
      id_inventarioMP: null,
      id_materiaPrima: '',
      nombre_articulo: '',
      cantidad: '',
      ubicacion_almacen: '',
    })
    setIsEdit(false)
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const newRecord = {
        ...formState,
        id_materiaPrima: parseInt(formState.id_materiaPrima),
        cantidad: parseInt(formState.cantidad),
      }

      try {
        if (isEdit) {
          await axios.put(`${API_URL}/${newRecord.id_inventarioMP}`, newRecord)
          // ¡MODIFICADO! - Se usa el modal y sin acentos
          abrirModalAlert('Registro actualizado exitosamente.')
        } else {
          // No enviamos id_inventarioMP al crear, la BD debe generarlo
          const { id_inventarioMP, ...recordToCreate } = newRecord
          await axios.post(API_URL, recordToCreate)
          // ¡MODIFICADO! - Se usa el modal y sin acentos
          abrirModalAlert('Registro agregado exitosamente.')
        }
        fetchInventario()
        setVisible(false) // Cierra el modal de formulario
        limpiarFormulario()
      } catch (error) {
        console.error('Error al guardar el registro:', error)
        // ¡MODIFICADO! - Se usa el modal y sin acentos
        abrirModalAlert('Hubo un error al guardar el registro.')
      }
    },
    [formState, isEdit, fetchInventario, abrirModalAlert, limpiarFormulario],
  )

  const abrirModalNuevo = useCallback(() => {
    limpiarFormulario()
    setIsEdit(false)
    setVisible(true)
  }, [limpiarFormulario])

  const abrirModalEditar = useCallback((item) => {
    setFormState({ ...item })
    setIsEdit(true)
    setVisible(true)
  }, [])

  const eliminarRegistro = useCallback(
    (id) => {
      // ¡MODIFICADO! - Se usa el modal y sin acentos
      abrirModalConfirm('¿Esta seguro de que desea eliminar este registro?', async () => {
        try {
          await axios.delete(`${API_URL}/${id}`)
          // ¡MODIFICADO! - Se usa el modal y sin acentos
          abrirModalAlert('Registro eliminado correctamente.')
          fetchInventario() // Recarga la lista
        } catch (error) {
          console.error('Error al eliminar el registro:', error)
          // ¡MODIFICADO! - Se usa el modal y sin acentos
          abrirModalAlert('Hubo un error al eliminar el registro.')
        }
      })
    },
    [abrirModalConfirm, abrirModalAlert, fetchInventario],
  )

  const inventarioFiltrado = inventario.filter(
    (item) =>
      (item.nombre_articulo?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (item.ubicacion_almacen?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (item.id_materiaPrima?.toString() ?? '').includes(searchTerm),
  )

  const generarReporteExcel = useCallback(() => {
    // ¡MODIFICADO! - Se usa el modal y sin acentos
    abrirModalConfirm('¿Desea generar el reporte en formato Excel?', () => {
      const dataToExport = inventarioFiltrado.map(
        ({ id_inventarioMP, id_materiaPrima, nombre_articulo, cantidad, ubicacion_almacen }) => ({
          'ID Inv. MP': id_inventarioMP,
          'ID MP': id_materiaPrima,
          'Nombre Articulo': nombre_articulo, // Sin acento
          Cantidad: cantidad,
          'Ubicacion Almacen': ubicacion_almacen, // Sin acento
        }),
      )

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario Materia Prima')
      XLSX.writeFile(workbook, 'reporte_inventario_materia_prima.xlsx')
      // ¡MODIFICADO! - Se usa el modal y sin acentos
      abrirModalAlert('Reporte generado y descargado exitosamente.')
    })
  }, [abrirModalConfirm, inventarioFiltrado, abrirModalAlert])

  const generarReportePDF = useCallback(() => {
    window.print()
  }, [])

  return (
    <CCard className="shadow-sm p-3 mb-5 bg-white rounded print-container">
      {/* ¡¡¡MODIFICADO!!! - Se añade el <style> para los botones y el logo */}
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
        
        /* ¡MODIFICADO! - Se oculta el logo en la vista normal */
        .logo-print { 
          display: none; 
        }

        /* ¡MODIFICADO! - Se usan tus estilos de App.css */
        .btn-beige {
          background-color: #d8c3a5 !important; /* beige suave */
          color: black !important;
          border: none;
        }
        .btn-beige:hover {
          background-color: #cbb69d !important; /* un poco más oscuro al pasar el mouse */
        }
        .btn-red {
          background-color: #c0392b !important;
          color: white !important;
          border: none;
        }
        .btn-red:hover {
          background-color: #a93226 !important;
        }
      `}</style>
      <CCardHeader className="border-0 bg-light no-print">
        {/* ¡MODIFICADO! - Sin acentos */}
        <h4 className="mb-0">Gestion de Inventario de Materia Prima</h4>
      </CCardHeader>
      <CCardBody>
        <div className="logo-print">
          {/* Aquí puedes poner el contenido de tu logo para impresión si lo necesitas */}
          <img src="logo_guaymuras1.jpg" alt="Logo de la Editorial Guaymuras" />
          <h1>Editorial Guaymuras</h1>
          <h2>Reporte de Inventario de Materia Prima</h2>
        </div>
        <CRow className="mb-3 g-3 no-print align-items-center">
          <CCol md={4}>
            <CFormInput
              type="text"
              // ¡MODIFICADO! - Sin acentos
              placeholder="Buscar por ID, nombre o ubicacion..."
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
              {/* ¡MODIFICADO! - Sin acentos */}
              <CTableHeaderCell scope="col">Nombre Articulo</CTableHeaderCell>
              <CTableHeaderCell scope="col">Cantidad</CTableHeaderCell>
              {/* ¡MODIFICADO! - Sin acentos */}
              <CTableHeaderCell scope="col">Ubicacion Almacen</CTableHeaderCell>
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
                <CTableDataCell className="no-print d-flex flex-wrap" style={{ gap: '0.5rem' }}>
                  {/* ¡¡¡CORREGIDO!!! - Se usan tus clases de App.css */}
                  <CButton className="me-2 btn-beige" onClick={() => abrirModalEditar(item)}>
                    Editar
                  </CButton>
                  {/* ¡¡¡CORREGIDO!!! - Se añade esta línea para ignorar el error de formato de Prettier */}
                  {/* eslint-disable-next-line prettier/prettier */}
                  <CButton className="btn-red" onClick={() => eliminarRegistro(item.id_inventarioMP)}>
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
                {/* ¡MODIFICADO! - Sin acentos */}
                <CFormLabel htmlFor="nombre_articulo">Nombre Articulo</CFormLabel>
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
                {/* ¡MODIFICADO! - Sin acentos */}
                <CFormLabel htmlFor="ubicacion_almacen">Ubicacion en Almacen</CFormLabel>
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

      {/* --- ¡¡NUEVOS MODALES!! --- */}

      {/* 1. Modal de Confirmación (reemplaza a window.confirm) */}
      <CModal visible={confirmVisible} onClose={() => setConfirmVisible(false)}>
        <CModalHeader>
          {/* ¡MODIFICADO! - Sin acentos */}
          <CModalTitle>Confirmacion</CModalTitle>
        </CModalHeader>
        <CModalBody>{confirmMessage}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={onConfirm}>
            Aceptar
          </CButton>
          <CButton color="secondary" onClick={() => setConfirmVisible(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 2. Modal de Alerta (reemplaza a alert) */}
      <CModal visible={alertVisible} onClose={() => setAlertVisible(false)}>
        <CModalHeader>
          <CModalTitle>Aviso</CModalTitle>
        </CModalHeader>
        <CModalBody>{alertMessage}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setAlertVisible(false)}>
            Entendido
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default InventarioMateriaPrima
