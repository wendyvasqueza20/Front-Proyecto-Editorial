// src/components/Libros/LibroModal.jsx
import React, { useState, useEffect } from 'react'
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap'

const LibroModal = ({
  show,
  onHide,
  onSubmit,
  formData,
  onChange,
  editId,
  loading = false,
  autores = [],
  temas = []
}) => {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validaciones
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case 'titulo':
        if (!value.trim()) {
          newErrors.titulo = 'El título es obligatorio'
        } else if (value.length < 2) {
          newErrors.titulo = 'El título debe tener al menos 2 caracteres'
        } else {
          delete newErrors.titulo
        }
        break

      case 'isbn':
        if (!value.trim()) {
          newErrors.isbn = 'El ISBN es obligatorio'
        } else if (!/^[0-9\-]+$/.test(value)) {
          newErrors.isbn = 'El ISBN solo puede contener números y guiones'
        } else {
          delete newErrors.isbn
        }
        break

      case 'edicion':
        if (!value.trim()) {
          newErrors.edicion = 'La edición es obligatoria'
        } else {
          delete newErrors.edicion
        }
        break

      case 'id_autor':
        if (!value) {
          newErrors.id_autor = 'Debe seleccionar un autor'
        } else {
          delete newErrors.id_autor
        }
        break

      case 'cantidad_disponible':
        if (value === '' || value < 0) {
          newErrors.cantidad_disponible = 'Debe ingresar una cantidad válida'
        } else {
          delete newErrors.cantidad_disponible
        }
        break

      case 'cantidad_minima':
        if (value === '' || value < 0) {
          newErrors.cantidad_minima = 'Debe ingresar una cantidad mínima válida'
        } else {
          delete newErrors.cantidad_minima
        }
        break

      default:
        break
    }

    return newErrors
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.titulo?.trim()) {
      newErrors.titulo = 'El título es obligatorio'
    }

    if (!formData.isbn?.trim()) {
      newErrors.isbn = 'El ISBN es obligatorio'
    }

    if (!formData.edicion?.trim()) {
      newErrors.edicion = 'La edición es obligatoria'
    }

    if (!formData.id_autor) {
      newErrors.id_autor = 'Debe seleccionar un autor'
    }

    if (formData.cantidad_disponible === '' || formData.cantidad_disponible < 0) {
      newErrors.cantidad_disponible = 'Debe ingresar una cantidad válida'
    }

    if (formData.cantidad_minima === '' || formData.cantidad_minima < 0) {
      newErrors.cantidad_minima = 'Debe ingresar una cantidad mínima válida'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    onChange(e)
    const newErrors = validateField(name, value)
    setErrors(newErrors)
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const allTouched = {}
    Object.keys(formData).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      onSubmit(e)
    }
  }

  useEffect(() => {
    if (!show) {
      setErrors({})
      setTouched({})
    }
  }, [show])

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editId !== null ? 'Actualizar Libro' : 'Registrar Libro'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hasErrors && Object.keys(touched).length > 0 && (
          <Alert variant="warning" className="mb-3">
            Por favor corrige los errores en el formulario antes de continuar.
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={formData.titulo || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.titulo && errors.titulo}
                isValid={touched.titulo && !errors.titulo}
              />
              <Form.Control.Feedback type="invalid">
                {errors.titulo}
              </Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Autor</Form.Label>
              <Form.Select
                name="id_autor"
                value={formData.id_autor || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.id_autor && errors.id_autor}
                isValid={touched.id_autor && !errors.id_autor}
              >
                <option value="">Seleccione un autor</option>
                {autores.map((autor) => (
                  <option key={autor.id} value={autor.id}>
                    {autor.nombre}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.id_autor}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={formData.isbn || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.isbn && errors.isbn}
                isValid={touched.isbn && !errors.isbn}
              />
              <Form.Control.Feedback type="invalid">
                {errors.isbn}
              </Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Edición</Form.Label>
              <Form.Control
                type="text"
                name="edicion"
                value={formData.edicion || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.edicion && errors.edicion}
                isValid={touched.edicion && !errors.edicion}
              />
              <Form.Control.Feedback type="invalid">
                {errors.edicion}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Cantidad Disponible</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_disponible"
                value={formData.cantidad_disponible || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.cantidad_disponible && errors.cantidad_disponible}
                isValid={touched.cantidad_disponible && !errors.cantidad_disponible}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cantidad_disponible}
              </Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Cantidad Mínima</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_minima"
                value={formData.cantidad_minima || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={loading}
                isInvalid={touched.cantidad_minima && errors.cantidad_minima}
                isValid={touched.cantidad_minima && !errors.cantidad_minima}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cantidad_minima}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label>Temas</Form.Label>
              <Form.Select
                name="temas"
                value={formData.temas || []}
                onChange={handleChange}
                multiple
                disabled={loading}
              >
                {temas.map((tema) => (
                  <option key={tema.id} value={tema.id}>
                    {tema.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || (hasErrors && Object.keys(touched).length > 0)}
            >
              {loading ? 'Guardando...' : (editId !== null ? 'Actualizar Libro' : 'Guardar Libro')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default LibroModal