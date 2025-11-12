// src/views/perfil/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import api from '../../services/axios';   // tu axios.js
import { toast } from 'react-toastify';
import './Profile.css';                  // opcional, ver abajo

const Profile = () => {
  const [form, setForm] = useState({
    nombres_usuario : '',
    apellidos_usuario: '',
    correo           : '',
    telefono         : '',
    usuario          : '',
  });
  const [pwd, setPwd] = useState({ nueva: '', repetir: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  /* ---------- carga inicial ---------- */
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) { window.location.href = '/#/login'; return; }

    (async () => {
      try {
        const { data } = await api.get('/api/v1/perfil');
        setForm({
          nombres_usuario : data.nombres_usuario  || '',
          apellidos_usuario: data.apellidos_usuario || '',
          correo           : data.correo            || '',
          telefono         : data.telefono          || '',
          usuario          : data.usuario           || '',
        });
      } catch (e) {
        toast.error('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- handlers ---------- */
  const handleChange = ({ target: { name, value } }) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombres_usuario.trim())  e.nombres_usuario  = 'Requerido';
    if (!form.apellidos_usuario.trim()) e.apellidos_usuario = 'Requerido';
    if (!form.correo.trim())            e.correo            = 'Requerido';
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = 'Correo inválido';
    if (form.telefono && !/^[0-9+\-\s()]{8,}$/.test(form.telefono))
      e.telefono = 'Formato inválido';
    if (pwd.nueva && pwd.nueva.length < 6)
      e.pwd = 'Mínimo 6 caracteres';
    if (pwd.nueva && pwd.nueva !== pwd.repetir)
      e.pwd = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (pwd.nueva) payload.contrasena = pwd.nueva;
      await api.put('/api/v1/perfil', payload);
      toast.success('Perfil actualizado');
      setPwd({ nueva: '', repetir: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="perfil-container">
      <Card className="perfil-card">
        <Card.Body>
          <h4 className="mb-4">Mi Perfil</h4>

          {errors.general && <Alert variant="danger">{errors.general}</Alert>}

          <Form onSubmit={guardarPerfil}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    name="nombres_usuario"
                    value={form.nombres_usuario}
                    onChange={handleChange}
                    isInvalid={!!errors.nombres_usuario}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombres_usuario}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    name="apellidos_usuario"
                    value={form.apellidos_usuario}
                    onChange={handleChange}
                    isInvalid={!!errors.apellidos_usuario}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apellidos_usuario}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control value={form.usuario} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                isInvalid={!!errors.correo}
              />
              <Form.Control.Feedback type="invalid">
                {errors.correo}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                isInvalid={!!errors.telefono}
              />
              <Form.Control.Feedback type="invalid">
                {errors.telefono}
              </Form.Control.Feedback>
            </Form.Group>

            <hr className="my-4" />
            <h6 className="text-muted mb-3">Cambiar contraseña (opcional)</h6>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nueva contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={pwd.nueva}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, nueva: e.target.value }))
                    }
                    isInvalid={!!errors.pwd}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Repetir contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={pwd.repetir}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, repetir: e.target.value }))
                    }
                    isInvalid={!!errors.pwd}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.pwd}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;