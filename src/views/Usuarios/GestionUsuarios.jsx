  // Función para registrar en bitácora
  const registrarBitacora = async (accion, descripcion) => {
    try {
      const usuario = localStorage.getItem('usuario') || 'Desconocido';
      await axiosInstance.post('/bitacora', {
        usuario,
        accion,
        descripcion,
        fecha: new Date().toISOString()
      });
    } catch (err) {
      // No interrumpir el flujo si falla la bitácora
      console.error('Error registrando en bitácora:', err);
    }
  };
// src/views/Usuarios/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance.js';
import { z } from 'zod';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const GestionUsuarios = () => {
  const [showModal, setShowModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    contraseña: '',
    confirmar: '',
  });
  const [passwordUserId, setPasswordUserId] = useState(null);

  const [formData, setFormData] = useState({
    usuario: '',
    nombre_usuario: '',
    contraseña: '',
    correo_electronico: '',
    numero_identidad: '',
    direccion1: '',
    direccion2: '',
    telefono: '',
    id_rol: 2,
    id_estado_usuario: 1,
  });

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,70}$/;
  const usuarioSchema = z.object({
    usuario: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    nombre_usuario: z.string().min(2).max(50),
    correo_electronico: z.string().email().optional().nullable(),
    numero_identidad: z.string().max(45).optional().nullable(),
    telefono: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos').max(15, 'El teléfono es demasiado largo').regex(/^\d+$/, 'El teléfono solo debe contener números'),
    id_rol: z.number().int().min(1).max(3),
    id_estado_usuario: z.number().int().min(0).max(1),
    ...(editId === null && {
      contraseña: z.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(70, 'La contraseña es demasiado larga')
        .regex(passwordRegex, 'Debe incluir mayúscula, minúscula, número y carácter especial'),
    })
  });

  const roles = [
    { value: 1, label: 'ADMINISTRADOR' },
    { value: 2, label: 'VENDEDOR' },
    { value: 3, label: 'ALMACENISTA' },
  ];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'id_rol' || name === 'id_estado_usuario' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToValidate = { ...formData };
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
        await registrarBitacora('Editar usuario', `Usuario editado: ${formData.usuario}`);
      } else {
        await axiosInstance.post(`${API_BASE_URL}/usuarios`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Usuario creado correctamente');
        await registrarBitacora('Crear usuario', `Usuario creado: ${formData.usuario}`);
      }
      fetchUsuarios();
      resetForm();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Error al guardar el usuario';
      toast.error(msg);
    }
  };

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
      telefono: usuario.telefono || '',
      id_rol: usuario.id_rol,
      id_estado_usuario: usuario.id_estado_usuario ?? 1,
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
      telefono: '',
      id_rol: 2,
      id_estado_usuario: 1,
    });
    setEditId(null);
    setShowModal(false);
    setShowPasswordModal(false);
  };

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
      await registrarBitacora('Eliminar usuario', `Usuario eliminado con id: ${idToDelete}`);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'No se pudo eliminar el usuario';
      toast.error(msg);
    } finally {
      closeDeleteModal();
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre_usuario} ${u.usuario}`.toLowerCase().includes(busqueda.toLowerCase())
  );

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
        <Table hover responsive className="m-0 text-light align-middle">
          <thead className="table-secondary text-dark">
            <tr>
              <th><i className="bi bi-person-circle me-1"/>Usuario</th>
              <th><i className="bi bi-person-lines-fill me-1"/>Nombre</th>
              <th><i className="bi bi-envelope-at me-1"/>Correo</th>
              <th><i className="bi bi-credit-card-2-front me-1"/>Identidad</th>
              <th><i className="bi bi-telephone me-1"/>Teléfono</th>
              <th><i className="bi bi-toggle-on me-1"/>Estado</th>
              <th><i className="bi bi-person-badge me-1"/>Rol</th>
              <th><i className="bi bi-gear me-1"/>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <span className="spinner-border spinner-border-sm text-primary me-2" role="status" />Cargando...
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id_usuario} className={usuario.id_estado_usuario === 0 ? 'table-danger' : ''}>
                  <td>{usuario.usuario}</td>
                  <td>{usuario.nombre_usuario}</td>
                  <td>{usuario.correo_electronico || '—'}</td>
                  <td>{usuario.numero_identidad || '—'}</td>
                  <td>{usuario.telefono || '—'}</td>
                  <td>
                    {usuario.id_estado_usuario === 1 ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-danger">Inactivo</span>
                    )}
                  </td>
                  <td>{roles.find((r) => r.value === usuario.id_rol)?.label || '—'}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      title="Editar usuario"
                      onClick={() => handleEdit(usuario)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      title="Eliminar usuario"
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
            <Card className="p-3 bg-light rounded shadow-sm mb-3">
              <h5 className="mb-3 text-primary">
                <i className="bi bi-person-badge me-2" />
                Datos del usuario
              </h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-person-circle me-1" /> Nombre de usuario *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                    required
                    placeholder="ej: editor123"
                    autoComplete="username"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-person-lines-fill me-1" /> Nombre completo *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre_usuario"
                    value={formData.nombre_usuario}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </Col>
              </Row>

              {/* Mostrar contraseña solo al crear */}
              {editId === null && (
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label>
                      <i className="bi bi-key me-1" /> Contraseña *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="contraseña"
                      value={formData.contraseña}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres, mayúscula, minúscula, número y símbolo"
                    />
                  </Col>
                </Row>
              )}

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-person-badge me-1" /> Rol *
                  </Form.Label>
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
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-toggle-on me-1" /> Estado *
                  </Form.Label>
                  <Form.Select
                    name="id_estado_usuario"
                    value={formData.id_estado_usuario}
                    onChange={handleChange}
                    required
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </Form.Select>
                </Col>
              </Row>
              <hr />
              <h6 className="mb-3 text-secondary">
                <i className="bi bi-envelope-at me-1" /> Contacto y dirección
              </h6>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-envelope-at me-1" /> Correo electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="correo_electronico"
                    value={formData.correo_electronico || ''}
                    onChange={handleChange}
                    placeholder="Ej: usuario@email.com"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-credit-card-2-front me-1" /> Número de identidad
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_identidad"
                    value={formData.numero_identidad || ''}
                    onChange={handleChange}
                    placeholder="Ej: 0801199912345"
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-geo-alt me-1" /> Dirección 1
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion1"
                    value={formData.direccion1 || ''}
                    onChange={handleChange}
                    placeholder="Ej: Barrio Centro, Calle 1"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-geo me-1" /> Dirección 2
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion2"
                    value={formData.direccion2 || ''}
                    onChange={handleChange}
                    placeholder="Opcional"
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>
                    <i className="bi bi-telephone me-1" /> Teléfono *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 98765432"
                    maxLength={15}
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={resetForm}>
                  <i className="bi bi-x-circle me-1" /> Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  <i className="bi bi-save me-1" /> {editId ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
              </div>
            </Card>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL CAMBIO DE CONTRASEÑA */}
      <Modal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>
            <i className="bi bi-key me-2" />
            Cambiar contraseña
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!passwordForm.contraseña || passwordForm.contraseña.length < 6) {
                toast.error('La contraseña debe tener al menos 6 caracteres');
                return;
              }
              if (!passwordRegex.test(passwordForm.contraseña)) {
                toast.error('La contraseña debe incluir mayúscula, minúscula, número y carácter especial.');
                return;
              }
              if (passwordForm.contraseña !== passwordForm.confirmar) {
                toast.error('Las contraseñas no coinciden');
                return;
              }
              try {
                const token = getAuthToken();
                await axiosInstance.put(
                  `${API_BASE_URL}/usuarios/${passwordUserId}`,
                  { contraseña: passwordForm.contraseña },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Contraseña actualizada');
                await registrarBitacora('Cambio de contraseña', `Cambio de contraseña para usuario con id: ${passwordUserId}`);
                setShowPasswordModal(false);
              } catch (err) {
                toast.error('Error al actualizar la contraseña');
              }
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.contraseña}
                onChange={e => setPasswordForm(f => ({ ...f, contraseña: e.target.value }))}
                minLength={6}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.confirmar}
                onChange={e => setPasswordForm(f => ({ ...f, confirmar: e.target.value }))}
                minLength={6}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL DE SEGURIDAD PARA ELIMINAR */}
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