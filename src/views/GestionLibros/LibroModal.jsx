import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'

const LibroModal = ({ show, onHide, onSubmit, formData, onChange, editId, autores = [], temas = [] }) => {
  const [touched, setTouched] = useState({})

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  useEffect(() => {
    if (!show) {
      setTouched({})
    }
  }, [show])

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{editId ? 'Actualizar Libro' : 'Añadir Libro'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={formData.titulo || ''}
                onChange={onChange}
                onBlur={handleBlur}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Autor</Form.Label>
              <Form.Select
                name="autorId"
                value={formData.autorId || ''}
                onChange={onChange}
                onBlur={handleBlur}
                required
              >
                <option value="">Seleccione un autor</option>
                {autores.map((autor) => (
                  <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={formData.isbn || ''}
                onChange={onChange}
                onBlur={handleBlur}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Edición</Form.Label>
              <Form.Control
                type="text"
                name="edicion"
                value={formData.edicion || ''}
                onChange={onChange}
                onBlur={handleBlur}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Temas</Form.Label>
              <Form.Select
                name="temaId"
                value={formData.temaId || ''}
                onChange={onChange}
                onBlur={handleBlur}
              >
                <option value="">Seleccione un tema</option>
                {temas.map((tema) => (
                  <option key={tema.id} value={tema.id}>{tema.nombre}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Cantidad Disponible</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_disponible"
                value={formData.cantidad_disponible || ''}
                onChange={onChange}
                onBlur={handleBlur}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Cantidad Mínima</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_minima"
                value={formData.cantidad_minima || ''}
                onChange={onChange}
                onBlur={handleBlur}
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            <Button variant="primary" type="submit">
              {editId ? 'Actualizar Libro' : 'Guardar Libro'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default LibroModal