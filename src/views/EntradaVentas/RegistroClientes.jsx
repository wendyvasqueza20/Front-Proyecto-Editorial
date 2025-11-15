
// src/views/EntradaVentas/RegistroClientes.jsx
import React, { useState, useEffect } from 'react'
import { Spinner, Alert } from 'react-bootstrap'
import axios from 'axios'
import Swal from 'sweetalert2'
import ClienteModal from '../../components/Clientes/ClienteModal'
import ClientesTable from '../../components/Clientes/ClientesTable'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const API_BASE_URL = 'http://localhost:5000/api/v1';

const RegistroClientes = () => {
  const [showModal, setShowModal] = useState(false)
  const [clientes, setClientes] = useState([])
  const [editId, setEditId] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [loading, setLoading] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [error, setError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  const [formData, setFormData] = useState({
    nombres_cliente: '',
    apellidos_cliente: '',
    identidad: '',
    direccion: '',
    telefono: '',
    correo: '',
    id_tipo_cliente: '',
  })

  const tiposClientes = [
    { value: '', label: 'Seleccione el tipo de cliente' },
    { value: 1, label: 'Minorista' },
    { value: 2, label: 'Mayorista' },
    { value: 3, label: 'Institucional' },
  ]

  // ✅ Mostrar SweetAlert de éxito
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#8a2c31',
      confirmButtonText: 'Aceptar',
      background: '#f5f1eb',
      color: '#5c3d24',
      customClass: {
        popup: 'sweet-alert-clientes',
        confirmButton: 'btn-sweet-alert'
      }
    })
  }

  // ✅ Mostrar SweetAlert de error
  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonColor: '#8b6f47',
      confirmButtonText: 'Aceptar',
      background: '#f5f1eb',
      color: '#5c3d24'
    })
  }

  // ✅ Mostrar SweetAlert de confirmación
  const showConfirmAlert = (title, text, confirmButtonText) => {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8a2c31',
      cancelButtonColor: '#8b6f47',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar',
      background: '#f5f1eb',
      color: '#5c3d24'
    })
  }

  // ✅ Verificar autenticación
  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      if (!token) {
        setError('No estás autenticado. Redirigiendo al login...');
        setTimeout(() => window.location.href = '/#/login', 2000);
        return false;
      }
      setAuthChecked(true);
      return true;
    };

    if (checkAuthentication()) {
      fetchClientes();
    }
  }, [filtroEstado]);

  // ✅ Obtener token
  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    if (!token) {
      setError('Token no encontrado. Redirigiendo al login...');
      setTimeout(() => window.location.href = '/#/login', 2000);
      return null;
    }
    return token;
  }

  // ✅ Obtener clientes
  const fetchClientes = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) return;

      let url = `${API_BASE_URL}/clientes`;
      if (filtroEstado !== 'todos') {
        url += `?estado=${filtroEstado}`;
      }

      const response = await axios.get(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setClientes(response.data);
    } catch (error) {
      console.error('❌ Error al cargar clientes:', error);
      if (error.response?.status === 401) {
        setError('Sesión expirada. Redirigiendo al login...');
        setTimeout(() => window.location.href = '/#/login', 2000);
      } else {
        setError(error.response?.data?.message || 'Error al cargar clientes');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cambiar estado individual con SweetAlert
  const cambiarEstadoCliente = async (idCliente, nombreCliente, estadoActual) => {
    const accion = estadoActual === 'activo' ? 'desactivar' : 'activar';
    
    const result = await showConfirmAlert(
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} cliente?`,
      `¿Seguro que desea ${accion} al cliente: ${nombreCliente}?`,
      `Sí, ${accion}`
    );

    if (!result.isConfirmed) return;

    const token = getAuthToken();
    if (!token) return;

    try {
      await axios.patch(`${API_BASE_URL}/clientes/${idCliente}/estado`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      showSuccessAlert(`Cliente ${accion}ado correctamente`);
      await fetchClientes();
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      showErrorAlert(error.response?.data?.message || `No se pudo ${accion} el cliente`);
    }
  };

  // ✅ Cambiar estado en batch con SweetAlert
  const cambiarEstadoBatch = async (accion, selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;

    const accionTexto = accion === 'activar' ? 'activar' : 'desactivar';
    
    const result = await showConfirmAlert(
      `¿${accionTexto.charAt(0).toUpperCase() + accionTexto.slice(1)} clientes?`,
      `¿Seguro que desea ${accionTexto} a ${selectedIds.length} clientes?`,
      `Sí, ${accionTexto}`
    );

    if (!result.isConfirmed) return;

    const token = getAuthToken();
    if (!token) return;

    try {
      const promises = selectedIds.map(id => 
        axios.patch(`${API_BASE_URL}/clientes/${id}/estado`, {}, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      await Promise.all(promises);
      showSuccessAlert(`${selectedIds.length} clientes ${accionTexto}ados correctamente`);
      await fetchClientes();
    } catch (error) {
      console.error('Error al cambiar estado batch:', error);
      showErrorAlert(`Error al ${accionTexto} clientes`);
    }
  };

  // ✅ Agregar nuevo cliente
  const handleAddClient = () => {
    resetForm();
    setShowModal(true);
  };

  // ✅ Editar cliente
  const handleEdit = (cliente) => {
    setEditId(cliente.id_cliente);
    setFormData({
      nombres_cliente: cliente.nombres_cliente || '',
      apellidos_cliente: cliente.apellidos_cliente || '',
      identidad: cliente.identidad || '',
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      id_tipo_cliente: cliente.id_tipo_cliente || '',
    });
    setShowModal(true);
  };

  // ✅ Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'id_tipo_cliente' ? Number(value) : value 
    });
  };

  // ✅ Guardar cliente (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    const token = getAuthToken();
    if (!token) {
      setModalLoading(false);
      return;
    }

    try {
      if (editId !== null) {
        await axios.put(`${API_BASE_URL}/clientes/${editId}`, formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        showSuccessAlert('Cliente actualizado correctamente');
      } else {
        await axios.post(`${API_BASE_URL}/clientes`, formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        showSuccessAlert('Cliente creado correctamente');
      }
      
      await fetchClientes();
      resetForm();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      showErrorAlert(error.response?.data?.message || 'Error al guardar cliente');
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ Resetear formulario
  const resetForm = () => {
    setFormData({
      nombres_cliente: '',
      apellidos_cliente: '',
      identidad: '',
      direccion: '',
      telefono: '',
      correo: '',
      id_tipo_cliente: '',
    });
    setEditId(null);
    setShowModal(false);
    setModalLoading(false);
  };

  // ✅ Loading y errores de autenticación
  if (!authChecked && !error) {
    return (
      <div className="container mt-4">
        <Alert variant="info" className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Verificando autenticación...
        </Alert>
      </div>
    );
  }

  if (error && (error.includes('autenticado') || error.includes('Sesión expirada') || error.includes('Token no encontrado'))) {
    return (
      <div className="container mt-4">
        <Alert variant="warning" className="text-center">
          <h4>{error}</h4>
          <Spinner animation="border" size="sm" className="me-2" />
          Redirigiendo al login...
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {/* ✅ TABLA CON TODAS LAS FEATURES - EL BOTÓN AGREGAR ESTÁ DENTRO DEL COMPONENTE */}
      <ClientesTable
        data={clientes}
        loading={loading}
        onEdit={handleEdit}
        onStatusChange={cambiarEstadoCliente}
        onAddClient={handleAddClient}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        tiposClientes={tiposClientes}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        onBatchAction={cambiarEstadoBatch}
      />

      {/* Modal */}
      <ClienteModal
        show={showModal}
        onHide={resetForm}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleChange}
        editId={editId}
        loading={modalLoading}
        tiposClientes={tiposClientes}
      />
    </div>
  )
}

export default RegistroClientes