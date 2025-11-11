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

  // --- ¡NUEVOS ESTADOS PARA LOS MODALES! ---
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  // --- FIN DE NUEVOS ESTADOS ---

  const API_URL = 'http://localhost:5000/api/inventario-general'

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

  // ¡MODIFICADO! - Envuelto en useCallback
  const fetchInventario = useCallback(async () => {
    try {
      const response = await axios.get(API_URL)
      setInventario(response.data)
    } catch (error) {
      console.error('Error al obtener los datos del inventario:', error)
      // ¡MODIFICADO! - Sin acentos
      // ¡MODIFICADO! - Se añade esta línea para ignorar el error de formato de Prettier
      // eslint-disable-next-line prettier/prettier
      abrirModalAlert('No se pudieron cargar los registros. Revisa que tu servidor backend este funcionando.')
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
      id_inventario: null,
      ISBN: '',
      existencias_actuales: '',
      ubicacion_libro: '',
    })
    setIsEdit(false)
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const newRecord = {
        ...formState,
        ISBN: parseInt(formState.ISBN),
        existencias_actuales: parseInt(formState.existencias_actuales),
      }

      try {
        if (isEdit) {
          await axios.put(`${API_URL}/${newRecord.id_inventario}`, newRecord)
          // ¡MODIFICADO! - Sin acentos
          abrirModalAlert('Registro actualizado exitosamente.')
        } else {
          const { id_inventario, ...recordToCreate } = newRecord
          await axios.post(API_URL, recordToCreate)
          // ¡MODIFICADO! - Sin acentos
          abrirModalAlert('Registro agregado exitosamente.')
        }

        fetchInventario()
        setVisible(false)
        limpiarFormulario()
      } catch (error) {
        console.error('Error al guardar el registro:', error)
        // ¡MODIFICADO! - Sin acentos
        abrirModalAlert('Ocurrio un error al guardar. Por favor, intentelo de nuevo.')
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
      // ¡MODIFICADO! - Sin acentos
      abrirModalConfirm('¿Esta seguro de que desea eliminar este registro?', async () => {
        try {
          await axios.delete(`${API_URL}/${id}`)
          // ¡MODIFICADO! - Sin acentos
          abrirModalAlert('Registro eliminado correctamente.')
          fetchInventario()
        } catch (error) {
          console.error('Error al eliminar el registro:', error)
          // ¡MODIFICADO! - Sin acentos
          abrirModalAlert('No se pudo eliminar el registro. Intentelo de nuevo.')
        }
      })
    },
    [abrirModalConfirm, abrirModalAlert, fetchInventario],
  )

  const inventarioFiltrado = inventario.filter(
    (item) =>
      (item.ISBN?.toString() ?? '').includes(searchTerm) ||
      (item.ubicacion_libro?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (item.existencias_actuales?.toString() ?? '').includes(searchTerm),
  )

  const generarReporteExcel = useCallback(() => {
    // ¡MODIFICADO! - Sin acentos
    abrirModalConfirm('¿Desea generar el reporte en formato Excel?', () => {
      const dataToExport = inventarioFiltrado.map(
        ({ id_inventario, ISBN, existencias_actuales, ubicacion_libro }) => ({
          'ID Inventario': id_inventario,
          ISBN: ISBN,
          Existencias: existencias_actuales,
          Ubicacion: ubicacion_libro, // Sin acento
        }),
      )

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario General')
      XLSX.writeFile(workbook, 'reporte_inventario_general.xlsx')
      // ¡MODIFICADO! - Sin acentos
      abrirModalAlert(
        'Reporte generado y descargado exitosamente. Nota: El archivo de Excel no contiene el logo ni los titulos del reporte, debe agregarlos manualmente.',
      )
    })
  }, [abrirModalConfirm, inventarioFiltrado, abrirModalAlert])

  const generarReportePDF = useCallback(() => {
    window.print()
  }, [])

  return (
    <CCard className="shadow-sm p-3 mb-5 bg-white rounded print-container">
      {/* ¡¡¡MODIFICADO!!! - El <style> se ha restaurado aquí */}
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
        
        /* ¡¡¡CORREGIDO!!! - Se oculta el logo en la vista normal */
        .logo-print { 
          display: none; 
        }

        /* ¡¡¡CORREGIDO!!! - Se usan tus estilos de App.css */
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
        <h4 className="mb-0">Gestión de Inventario General</h4>
      </CCardHeader>
      <CCardBody>
        <div className="logo-print">
          <img src="logo_guaymuras1.jpg" alt="Logo de la Editorial Guaymuras" />
          <h1>Editorial Guaymuras</h1>
          <h2>Reporte de Inventario General</h2>
        </div>
        <CRow className="mb-3 g-3 no-print align-items: center">
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
                <CTableDataCell className="no-print d-flex flex-wrap" style={{ gap: '0.5rem' }}>
                  {/* ¡¡¡CORREGIDO!!! - Se usan tus clases de App.css */}
                  <CButton className="me-2 btn-beige" onClick={() => abrirModalEditar(item)}>
                    Editar
                  </CButton>
                  {/* ¡¡¡CORREGIDO!!! - Se usan tus clases de App.css */}
                  <CButton className="btn-red" onClick={() => eliminarRegistro(item.id_inventario)}>
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

      {/* --- ¡¡NUEVOS MODALES!! --- */}

      {/* 1. Modal de Confirmación (reemplaza a window.confirm) */}
      <CModal visible={confirmVisible} onClose={() => setConfirmVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirmacion</CModalTitle> {/* Sin acento */}
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

export default InventarioGeneral
