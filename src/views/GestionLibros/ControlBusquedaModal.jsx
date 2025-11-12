import React, { useState } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'

const ControlBusquedaModal = ({ show, onHide, onBuscar, onSolicitarReposicion }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    tema: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    onBuscar(formData)
  }

  const handleReposicion = () => {
    onSolicitarReposicion()
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Control y Búsqueda de Libros</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleBuscar}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Autor</Form.Label>
              <Form.Control
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Tema</Form.Label>
              <Form.Control
                type="text"
                name="tema"
                value={formData.tema}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            <Button variant="primary" type="submit">Buscar</Button>
            <Button variant="warning" onClick={handleReposicion}>Solicitar Reposición</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default ControlBusquedaModal