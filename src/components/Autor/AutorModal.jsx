import React, { useState, useEffect } from 'react'
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap'

const AutorModal = ({
  show,
  onHide,
  onGuardarAutor,
  onVincularAutor,
  autores = [],
  libros = [],
  formData,
  onChange,
  editId,
  loading = false
}) => {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (!show) {
      setErrors({})
      setTouched({})
    }
  }, [show])

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    if (name === 'nombre_completo') {
      if (!value.trim()) newErrors.nombre_completo = 'El nombre es obligatorio'
      else delete newErrors.nombre_completo
    }

    if (name === 'biografia') {
      if (!value.trim()) newErrors.biografia = 'La biografía es obligatoria'
      else delete newErrors.biografia
    }

    return newErrors
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nombre_completo?.trim()) newErrors.nombre_completo = 'El nombre es obligatorio'
    if (!formData.biografia?.trim()) newErrors.biografia = 'La biografía es obligatoria'
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

  const handleSubmitAutor = (e) => {
    e.preventDefault()
    const allTouched = {}
    Object.keys(formData).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      onGuardarAutor(e)
    }
  }

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editId !== null ? 'Editar Autor' : 'Registrar Autor'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmitAutor} noValidate>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.nombre_completo && errors.nombre_completo}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nombre_completo}
              </Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Biografía</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="biografia"
                value={formData.biografia || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.biografia && errors.biografia}
              />
              <Form.Control.Feedback type="invalid">
                {errors.biografia}
              </Form.Control.Feedback>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (editId !== null ? 'Actualizar Autor' : 'Guardar Autor')}
            </Button>
          </div>
        </Form>

        <hr />

        <h5 className="mt-4">Vincular Autor a Libro</h5>
        <Form className="mt-3">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Seleccionar Autor</Form.Label>
              <Form.Select
                name="autor_vincular"
                value={formData.autor_vincular || ''}
                onChange={handleChange}
              >
                <option value="">Seleccione un autor</option>
                {autores.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre_completo}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Seleccionar Libro</Form.Label>
              <Form.Select
                name="libro_vincular"
                value={formData.libro_vincular || ''}
                onChange={handleChange}
              >
                <option value="">Seleccione un libro</option>
                {libros.map(l => (
                  <option key={l.id} value={l.id}>{l.titulo}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button
              variant="success"
              onClick={() => onVincularAutor(formData.autor_vincular, formData.libro_vincular)}
              disabled={!formData.autor_vincular || !formData.libro_vincular}
            >
              Vincular Autor
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default AutorModal