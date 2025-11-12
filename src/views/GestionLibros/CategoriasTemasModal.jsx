import React, { useState } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'

const CategoriasTemasModal = ({
  show,
  onHide,
  onCrearCategoria,
  onAsignarCategoria,
  onCrearTema,
  onAsignarTema,
  libros = [],
  categorias = [],
  temas = []
}) => {
  const [formData, setFormData] = useState({
    nuevaCategoria: '',
    libroCategoriaId: '',
    categoriaId: '',
    nuevoTema: '',
    libroTemaId: '',
    temaId: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Gestión de Categorías y Temas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Crear Categoría */}
        <h5>Crear Categoría</h5>
        <Form className="mb-3">
          <Row>
            <Col md={8}>
              <Form.Control
                type="text"
                name="nuevaCategoria"
                value={formData.nuevaCategoria}
                onChange={handleChange}
                placeholder="Nombre de la categoría"
              />
            </Col>
            <Col md={4}>
              <Button variant="primary" onClick={() => onCrearCategoria(formData.nuevaCategoria)}>
                Guardar Categoría
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Asignar Categoría a Libro */}
        <h5>Asignar Categoría a Libro</h5>
        <Form className="mb-3">
          <Row>
            <Col>
              <Form.Select name="libroCategoriaId" value={formData.libroCategoriaId} onChange={handleChange}>
                <option value="">Seleccione un libro</option>
                {libros.map(libro => (
                  <option key={libro.id} value={libro.id}>{libro.titulo}</option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select name="categoriaId" value={formData.categoriaId} onChange={handleChange}>
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Button variant="success" onClick={() => onAsignarCategoria(formData.libroCategoriaId, formData.categoriaId)}>
                Asignar Categoría
              </Button>
            </Col>
          </Row>
        </Form>

        <hr />

        {/* Crear Tema */}
        <h5>Crear Tema</h5>
        <Form className="mb-3">
          <Row>
            <Col md={8}>
              <Form.Control
                type="text"
                name="nuevoTema"
                value={formData.nuevoTema}
                onChange={handleChange}
                placeholder="Nombre del tema"
              />
            </Col>
            <Col md={4}>
              <Button variant="primary" onClick={() => onCrearTema(formData.nuevoTema)}>
                Guardar Tema
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Asignar Tema a Libro */}
        <h5>Asignar Tema a Libro</h5>
        <Form>
          <Row>
            <Col>
              <Form.Select name="libroTemaId" value={formData.libroTemaId} onChange={handleChange}>
                <option value="">Seleccione un libro</option>
                {libros.map(libro => (
                  <option key={libro.id} value={libro.id}>{libro.titulo}</option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select name="temaId" value={formData.temaId} onChange={handleChange}>
                <option value="">Seleccione un tema</option>
                {temas.map(tema => (
                  <option key={tema.id} value={tema.id}>{tema.nombre}</option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Button variant="success" onClick={() => onAsignarTema(formData.libroTemaId, formData.temaId)}>
                Asignar Tema
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default CategoriasTemasModal