
// src/views/EntradaVentas/RegistroClientes.jsx
import React, { useState, useEffect } from 'react'
import { Button, Table, Card, InputGroup, Spinner, Alert, Badge } from 'react-bootstrap'
import { toast } from 'react-toastify'
import axios from 'axios'
import ClienteModal from '../../components/Clientes/ClienteModal' 
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const API_BASE_URL = 'http://localhost:5000/api/v1';

const RegistroClientes = () => {
  const [showModal, setShowModal] = useState(false)
  const [clientes, setClientes] = useState([])
  const [editId, setEditId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('activo') // Nuevo estado para filtro
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

  // ✅ DEBUG: Verificar qué hay en localStorage
  useEffect(() => {
    console.log('🔍 DEBUG - localStorage completo:', localStorage);
    console.log('🔍 DEBUG - auth_token:', localStorage.getItem('auth_token'));
    console.log('🔍 DEBUG - access_token:', localStorage.getItem('access_token'));
    console.log('🔍 DEBUG - user_data:', localStorage.getItem('user_data'));
  }, []);

  // ✅ Verificar autenticación
  useEffect(() => {
    const checkAuthentication = () => {
      const authToken = localStorage.getItem('auth_token');
      const accessToken = localStorage.getItem('access_token');
      const token = authToken || accessToken;
      
      console.log('🔐 Token encontrado:', token);
      
      if (!token) {
        console.log('❌ No hay token, redirigiendo al login...');
        setError('No estás autenticado. Redirigiendo al login...');
        setTimeout(() => {
          window.location.href = '/#/login';
        }, 2000);
        return false;
      }
      
      console.log('✅ Token válido encontrado');
      setAuthChecked(true);
      return true;
    };

    if (checkAuthentication()) {
      fetchClientes();
    }
  }, [filtroEstado]); // Agregar filtroEstado como dependencia

  // ✅ Obtener token
  const getAuthToken = () => {
    const authToken = localStorage.getItem('auth_token');
    const accessToken = localStorage.getItem('access_token');
    const token = authToken || accessToken;
    
    if (!token) {
      setError('Token no encontrado. Redirigiendo al login...');
      setTimeout(() => {
        window.location.href = '/#/login';
      }, 2000);
      return null;
    }
    
    return token;
  }

  // ✅ Obtener clientes del backend con filtro de estado
  const fetchClientes = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) return;

      console.log('📡 Haciendo request a /clientes con filtro:', filtroEstado);

      let url = `${API_BASE_URL}/clientes`;
      // Agregar filtro de estado si no es "todos"
      if (filtroEstado !== 'todos') {
        url += `?estado=${filtroEstado}`;
      }

      const response = await axios.get(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Clientes cargados:', response.data);
      setClientes(response.data);
    } catch (error) {
      console.error('❌ Error al cargar clientes:', error);
      console.error('❌ Response:', error.response);
      
      if (error.response?.status === 401) {
        setError('Sesión expirada. Redirigiendo al login...');
        setTimeout(() => {
          window.location.href = '/#/login';
        }, 2000);
      } else if (error.response?.status === 404) {
        setError('Endpoint no encontrado. Verifica la ruta del backend.');
      } else {
        setError(error.response?.data?.message || 'Error al cargar clientes');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cambiar estado del cliente (activo/inactivo)
  const cambiarEstadoCliente = async (idCliente, nombreCliente, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const accion = estadoActual === 'activo' ? 'desactivar' : 'activar';
    
    if (!window.confirm(`¿Seguro que desea ${accion} al cliente: ${nombreCliente}?`)) return;

    const token = getAuthToken();
    if (!token) return;

    try {
      await axios.patch(`${API_BASE_URL}/clientes/${idCliente}/estado`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(`Cliente ${accion}ado correctamente`);
      await fetchClientes(); // Recargar la lista
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      toast.error(error.response?.data?.message || `No se pudo ${accion} el cliente`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'id_tipo_cliente' ? Number(value) : value 
    });
  };

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
        toast.success('Cliente actualizado correctamente');
      } else {
        await axios.post(`${API_BASE_URL}/clientes`, formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Cliente creado correctamente');
      }
      
      await fetchClientes();
      resetForm();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast.error(error.response?.data?.message || 'Error al guardar cliente');
    } finally {
      setModalLoading(false);
    }
  };

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

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombres_cliente || ''} ${c.apellidos_cliente || ''}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // ✅ Mostrar loading mientras verifica autenticación
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

  // ✅ Mostrar error de autenticación
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
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h4 className="fw-bold" style={{ color: '#8a2c31' }}>
          Clientes
        </h4>
      </div>

      {error && !error.includes('Redirigiendo') && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-3 align-items-center">
          <div className="input-group" style={{ width: '300px' }}>
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

          {/* Filtro de estado */}
          <div className="input-group" style={{ width: '200px' }}>
            <select
              className="form-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>

        <Button 
          className="mb-3" 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ backgroundColor: '#8a2c31', borderColor: '#8a2c31' }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Cliente
        </Button>
      </div>

      <Card className="bg-white text-dark">
        <Table hover responsive className="m-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Identidad</th>
              <th>Correo</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center">
                  <Spinner animation="border" size="sm" /> Cargando clientes...
                </td>
              </tr>
            ) : clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No hay clientes {filtroEstado !== 'todos' ? `${filtroEstado}s` : ''} registrados.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.id_cliente}>
                  <td>{cliente.id_cliente}</td>
                  <td>
                    {cliente.nombres_cliente} {cliente.apellidos_cliente}
                  </td>
                  <td>{cliente.identidad || '—'}</td>
                  <td>{cliente.correo || '—'}</td>
                  <td>{cliente.direccion || '—'}</td>
                  <td>{cliente.telefono || '—'}</td>
                  <td>
                    {tiposClientes.find((t) => t.value === cliente.id_tipo_cliente)?.label || '—'}
                  </td>
                  <td>
                    <Badge 
                      bg={cliente.estado_cliente === 'activo' ? 'success' : 'secondary'}
                      text={cliente.estado_cliente === 'activo' ? 'white' : 'white'}
                    >
                      {cliente.estado_cliente === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(cliente)}
                      title="Editar cliente"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant={cliente.estado_cliente === 'activo' ? 'danger' : 'success'}
                      size="sm"
                      onClick={() => cambiarEstadoCliente(
                        cliente.id_cliente, 
                        `${cliente.nombres_cliente} ${cliente.apellidos_cliente}`,
                        cliente.estado_cliente
                      )}
                      title={cliente.estado_cliente === 'activo' ? 'Desactivar cliente' : 'Activar cliente'}
                    >
                      <i className={`bi ${cliente.estado_cliente === 'activo' ? 'bi-person-x' : 'bi-person-check'}`}></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Información de registros */}
      <div className="mt-3 text-muted">
        Mostrando {clientesFiltrados.length} de {clientes.length} registros
        {filtroEstado !== 'todos' && ` (filtrado por: ${filtroEstado})`}
      </div>

      {/* ✅ MODAL SEPARADO */}
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