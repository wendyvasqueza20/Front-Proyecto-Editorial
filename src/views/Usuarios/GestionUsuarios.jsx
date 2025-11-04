// src/views/Usuarios/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance.js';
import { z } from 'zod';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const GestionUsuarios = () => {
  /* ----------------------------------------------------
     ESTADOS
  ---------------------------------------------------- */
  const [showModal, setShowModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  /* --- Modal de seguridad para eliminar --- */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  /* --- Ojito contraseña --- */
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    usuario: '',
    nombre_usuario: '',
    contraseña: '',
    correo_electronico: '',
    numero_identidad: '',
    direccion1: '',
    direccion2: '',
    id_rol: 2,
  });

  /* ----------------------------------------------------
     ESQUEMA ZOD
  ---------------------------------------------------- */
  const usuarioSchema = z.object({
    usuario: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    nombre_usuario: z.string().min(2).max(50),
    contraseña:
      editId === null
        ? z.string().min(6).max(70)
        : z.string().min(6).max(70).optional(),
    correo_electronico: z.string().email().optional().nullable(),
    numero_identidad: z.string().max(45).optional().nullable(),
    id_rol: z.number().int().min(1).max(3),
  });

  const roles = [
    { value: 1, label: 'ADMINISTRADOR' },
    { value: 2, label: 'VENDEDOR'  },
    { value: 3, label: 'ALMACENISTA' },
  ];

  /* ----------------------------------------------------
     HELPERS
  ---------------------------------------------------- */
  const getAuthToken = () => localStorage.getItem('access_token');

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No autenticado');
      const res = await axiosInstance.get(`${API_BASE_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar usuarios. Verifica tu sesión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  /* ----------------------------------------------------
     HANDLERS FORM
  ---------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'id_rol' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToValidate = { ...formData };
      if (editId !== null) delete dataToValidate.contraseña;
      usuarioSchema.parse(dataToValidate);
    } catch (err) {
      const errors = err.flatten().fieldErrors;
      let msg = 'Corrige los siguientes errores:\n';
      Object.entries(errors).forEach(([field, msgs]) => {
        msg += `- ${field}: ${msgs.join(', ')}\n`;
      });
      toast.error(msg);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Sesión expirada. Inicia sesión nuevamente.');
      return;
    }

    try {
      if (editId !== null) {
        await axiosInstance.put(`${API_BASE_URL}/usuarios/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        await axiosInstance.post(`${API_BASE_URL}/usuarios`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Usuario creado correctamente');
      }
      fetchUsuarios();
      resetForm();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Error al guardar el usuario';
      toast.error(msg);
    }
  };

  /* ----------------------------------------------------
     EDITAR / RESET
  ---------------------------------------------------- */
  const handleEdit = (usuario) => {
    setEditId(usuario.id_usuario);
    setFormData({
      usuario: usuario.usuario,
      nombre_usuario: usuario.nombre_usuario,
      contraseña: '',
      correo_electronico: usuario.correo_electronico || '',
      numero_identidad: usuario.numero_identidad || '',
      direccion1: usuario.direccion1 || '',
      direccion2: usuario.direccion2 || '',
      id_rol: usuario.id_rol,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      usuario: '',
      nombre_usuario: '',
      contraseña: '',
      correo_electronico: '',
      numero_identidad: '',
      direccion1: '',
      direccion2: '',
      id_rol: 2,
    });
    setEditId(null);
    setShowModal(false);
    setShowPassword(false);
  };

  /* ----------------------------------------------------
     ELIMINAR (con modal + toast)
  ---------------------------------------------------- */
  const openDeleteModal = (id) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setIdToDelete(null);
  };

  const confirmDelete = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Sesión expirada');
      closeDeleteModal();
      return;
    }
    try {
      await axiosInstance.delete(`${API_BASE_URL}/usuarios/${idToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Usuario eliminado correctamente');
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'No se pudo eliminar el usuario';
      toast.error(msg);
    } finally {
      closeDeleteModal();
    }
  };

  /* ----------------------------------------------------
     FILTRO
  ---------------------------------------------------- */
  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre_usuario} ${u.usuario}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  /* ----------------------------------------------------
     RENDER
  ---------------------------------------------------- */
  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h4 className="fw-bold" style={{ color: '#8a2c31' }}>
          Gestión de Usuarios
        </h4>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
        </div>
        <Button
          variant="success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-1"></i> Agregar Usuario
        </Button>
      </div>

      <Card className="bg-dark text-light">
        <Table hover responsive className="m-0 text-light">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Identidad</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Cargando...
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.usuario}</td>
                  <td>{usuario.nombre_usuario}</td>
                  <td>{usuario.correo_electronico || '—'}</td>
                  <td>{usuario.numero_identidad || '—'}</td>
                  <td>
                    {roles.find((r) => r.value === usuario.id_rol)?.label ||
                      '—'}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(usuario)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(usuario.id_usuario)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/*  MODAL CREAR / EDITAR  */}
      <Modal
        show={showModal}
        onHide={resetForm}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>
            {editId ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Nombre de usuario *</Form.Label>
                <Form.Control
                  type="text"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  required
                  placeholder="ej: editor123"
                />
              </Col>
              <Col md={6}>
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>

            {/*  CONTRASEÑA + OJITO  */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Contraseña {editId ? '(opcional)' : '*'}</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleChange}
                    required={!editId}
                    placeholder={
                      editId ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'
                    }
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'} />
                  </Button>
                </InputGroup>
              </Col>

              <Col md={6}>
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  name="id_rol"
                  value={formData.id_rol}
                  onChange={handleChange}
                  required
                >
                  {roles.map((rol) => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="correo_electronico"
                  value={formData.correo_electronico || ''}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Número de identidad</Form.Label>
                <Form.Control
                  type="text"
                  name="numero_identidad"
                  value={formData.numero_identidad || ''}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Dirección 1</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion1"
                  value={formData.direccion1 || ''}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Dirección 2</Form.Label>
                <Form.Control
                  type="text"
                  name="direccion2"
                  value={formData.direccion2 || ''}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editId ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/*  MODAL DE SEGURIDAD PARA ELIMINAR  */}
      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle-fill text-warning me-2" />
            Confirmar eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          ¿Estás seguro de que deseas eliminar este usuario? <br />
          <span className="text-danger fw-bold">
            Esta acción no se puede deshacer.
          </span>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-light">
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionUsuarios;