import React, { useState } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'

const AutorModal = ({ show, onHide, onSubmitAutor, onSubmitVinculo, autores, libros }) => {
  const [formData, setFormData] = useState({ nombre_completo: '', biografia: '', autorId: '', libroId: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleGuardarAutor = () => {
    onSubmitAutor(formData)
    setFormData({ ...formData, nombre_completo: '', biografia: '' })
  }

  const handleVincular = () => {
    onSubmitVinculo({ autorId: formData.autorId, libroId: formData.libroId })
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Gestión de Autores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Añadir Autor</h5>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} />
            </Col>
            <Col>
              <Form.Label>Biografía</Form.Label>
              <Form.Control name="biografia" value={formData.biografia} onChange={handleChange} />
            </Col>
          </Row>
          <Button variant="primary" onClick={handleGuardarAutor}>Guardar Autor</Button>
        </Form>

        <hr />

        <h5>Vincular Autor a Libro</h5>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Label>Autor</Form.Label>
              <Form.Select name="autorId" value={formData.autorId} onChange={handleChange}>
                <option value="">Seleccione un autor</option>
                {autores.map((autor) => (
                  <option key={autor.id} value={autor.id}>{autor.nombre}</option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Label>Libro</Form.Label>
              <Form.Select name="libroId" value={formData.libroId} onChange={handleChange}>
                <option value="">Seleccione un libro</option>
                {libros.map((libro) => (
                  <option key={libro.id} value={libro.id}>{libro.titulo}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Button variant="success" onClick={handleVincular}>Vincular</Button>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default AutorModal