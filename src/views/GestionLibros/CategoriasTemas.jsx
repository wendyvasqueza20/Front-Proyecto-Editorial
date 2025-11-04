// src/views/GestionLibros/CategoriasTemas.jsx
import React, { useState, useEffect } from 'react'
import {
  Table, Form, InputGroup, Button, Row, Col, Alert, Spinner, Modal
} from 'react-bootstrap'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_BASE_URL = 'http://localhost:5000/api/v1'

const CategoriasTemas = () => {
  const [libros, setLibros] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('titulo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [showModalCategoria, setShowModalCategoria] = useState(false)
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [categorias, setCategorias] = useState([])

  const [showModalAsignarCategoria, setShowModalAsignarCategoria] = useState(false)
  const [libroSeleccionado, setLibroSeleccionado] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')

  const [showModalTema, setShowModalTema] = useState(false)
  const [nombreTema, setNombreTema] = useState('')
  const [temas, setTemas] = useState([])

  const [showModalAsignarTema, setShowModalAsignarTema] = useState(false)
  const [temaSeleccionado, setTemaSeleccionado] = useState('')

  useEffect(() => {
    fetchLibros()
    fetchCategorias()
    fetchTemas()
  }, [])

  const fetchLibros = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/libros`)
      setLibros(res.data)
    } catch (err) {
      console.error('Error al cargar libros:', err)
      setError('No se pudieron cargar los libros')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categorias`)
      setCategorias(res.data)
    } catch (err) {
      console.error('Error al cargar categorías:', err)
    }
  }

  const fetchTemas = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/temas`)
      setTemas(res.data)
    } catch (err) {
      console.error('Error al cargar temas:', err)
    }
  }

  const librosFiltrados = libros.filter((libro) => {
    const valor = busqueda.toLowerCase()
    switch (filtro) {
      case 'titulo':
        return libro.titulo.toLowerCase().includes(valor)
      case 'autor':
        return libro.autor_nombre?.toLowerCase().includes(valor)
      case 'isbn':
        return libro.isbn?.toLowerCase().includes(valor)
      case 'tema':
        return libro.temas?.some(t => t.nombre.toLowerCase().includes(valor))
      default:
        return true
    }
  })

  const solicitarReposicion = async (libroId) => {
    try {
      await axios.post(`${API_BASE_URL}/libros/${libroId}/reposicion`)
      Swal.fire('Solicitud enviada', 'La solicitud de reposición fue enviada correctamente.', 'success')
    } catch (err) {
      console.error('Error al solicitar reposición:', err)
      Swal.fire('Error', 'No se pudo enviar la solicitud de reposición.', 'error')
    }
  }

  const handleGuardarCategoria = async () => {
    try {
      await axios.post(`${API_BASE_URL}/categorias`, { nombre: nombreCategoria })
      Swal.fire('Categoría creada', '', 'success')
      setNombreCategoria('')
      setShowModalCategoria(false)
      fetchCategorias()
    } catch (err) {
      Swal.fire('Error al crear categoría', '', 'error')
    }
  }

  const handleAsignarCategoria = async () => {
    try {
      await axios.post(`${API_BASE_URL}/libros/${libroSeleccionado}/categorias`, {
        id_categoria: categoriaSeleccionada
      })
      Swal.fire('Categoría asignada', '', 'success')
      setShowModalAsignarCategoria(false)
    } catch (err) {
      Swal.fire('Error al asignar categoría', '', 'error')
    }
  }

  const handleGuardarTema = async () => {
    try {
      await axios.post(`${API_BASE_URL}/temas`, { nombre: nombreTema })
      Swal.fire('Tema creado', '', 'success')
      setNombreTema('')
      setShowModalTema(false)
      fetchTemas()
    } catch (err) {
      Swal.fire('Error al crear tema', '', 'error')
    }
  }

  const handleAsignarTema = async () => {
    try {
      await axios.post(`${API_BASE_URL}/libros/${libroSeleccionado}/temas`, {
        id_tema: temaSeleccionado
      })
      Swal.fire('Tema asignado', '', 'success')
      setShowModalAsignarTema(false)
    } catch (err) {
      Swal.fire('Error al asignar tema', '', 'error')
    }
  }

  return (
    <div className="container mt-4">
      <h4 className="text-center fw-bold mb-4" style={{ color: '#8a2c31' }}>
        Control y Búsqueda de Libros
      </h4>

      <div className="d-flex gap-2 justify-content-center mb-3">
        <Button variant="outline-primary" onClick={() => setShowModalCategoria(true)}>
          <i className="bi bi-folder-plus me-1"></i> Crear Categoría
        </Button>
        <Button variant="outline-success" onClick={() => setShowModalAsignarCategoria(true)}>
          <i className="bi bi-folder-check me-1"></i> Asignar Categoría
        </Button>
        <Button variant="outline-primary" onClick={() => setShowModalTema(true)}>
          <i className="bi bi-bookmark-plus me-1"></i> Crear Tema
        </Button>
        <Button variant="outline-success" onClick={() => setShowModalAsignarTema(true)}>
          <i className="bi bi-bookmark-check me-1"></i> Asignar Tema
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="titulo">Buscar por Título</option>
            <option value="autor">Buscar por Autor</option>
            <option value="isbn">Buscar por ISBN</option>
            <option value="tema">Buscar por Tema</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder={`Buscar por ${filtro}...`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
          </InputGroup>
        </Col>
        <Col md={2} className="text-end">
          <Button variant="outline-secondary" onClick={() => {
            setBusqueda('')
            setFiltro('titulo')
          }}>
            <i className="bi bi-x-circle me-1"></i> Limpiar filtros
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>ISBN</th>
            <th>Edición</th>
            <th>Disponible</th>
            <th>Mínima</th>
            <th>Temas</th>
            <th>Reposición</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="text-center">
                <Spinner animation="border" size="sm" /> Cargando libros...
              </td>
            </tr>
          ) : librosFiltrados.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-muted">
                No se encontraron libros.
              </td>
            </tr>
          ) : (
            librosFiltrados.map((libro) => (
              <tr key={libro.id_libro}>
                <td>{libro.titulo}</td>
                <td>{libro.autor_nombre}</td>
                <td>{libro.isbn}</td>
                <td>{libro.edicion}</td>
                <td>{libro.cantidad_disponible}</td>
                <td>{libro.cantidad_minima}</td>
                <td>{libro.temas?.map(t => t.nombre).join(', ')}</td>
                <td>
                  {libro.cantidad_disponible <= libro.cantidad_minima ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => solicitarReposicion(libro.id_libro)}
                    >
                      Solicitar
                    </Button>
                  ) : (
                    <span className="text-muted">Suficiente</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modales */}
      <Modal show={showModalCategoria} onHide={() => setShowModalCategoria(false)}>
        <Modal.Header closeButton><Modal.Title>Crear Categoría</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalCategoria(false)}>Cerrar</Button>
          <Button variant="primary" onClick={handleGuardarCategoria}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAsignarCategoria} onHide={() => setShowModalAsignarCategoria(false)}>
        <Modal.Header closeButton><Modal.Title>Asignar Categoría a Libro</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Libro</Form.Label>
            <Form.Select value={libroSeleccionado} onChange={(e) => setLibroSeleccionado(e.target.value)}>
              {libros.map(libro => <option key={libro.id_libro} value={libro.id_libro}>{libro.titulo}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Categoría</Form.Label>
            <Form.Select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
              {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalAsignarCategoria(false)}>Cerrar</Button>
          <Button variant="success" onClick={handleAsignarCategoria}>Asignar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalTema} onHide={() => setShowModalTema(false)}>
        <Modal.Header closeButton><Modal.Title>Crear Tema</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={nombreTema} onChange={(e) => setNombreTema(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalTema(false)}>Cerrar</Button>
          <Button variant="primary" onClick={handleGuardarTema}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAsignarTema} onHide={() => setShowModalAsignarTema(false)}>
        <Modal.Header closeButton><Modal.Title>Asignar Tema a Libro</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Libro</Form.Label>
            <Form.Select value={libroSeleccionado} onChange={(e) => setLibroSeleccionado(e.target.value)}>
              {libros.map(libro => <option key={libro.id_libro} value={libro.id_libro}>{libro.titulo}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Tema</Form.Label>
            <Form.Select value={temaSeleccionado} onChange={(e) => setTemaSeleccionado(e.target.value)}>
              {temas.map(t => <option key={t.id_tema} value={t.id_tema}>{t.nombre}</option>)}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalAsignarTema(false)}>Cerrar</Button>
          <Button variant="success" onClick={handleAsignarTema}>Asignar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CategoriasTemas