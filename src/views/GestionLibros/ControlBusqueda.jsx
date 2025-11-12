// src/views/GestionLibros/ControlBusqueda.jsx
import React, { useState, useEffect } from 'react'
import { Table, Form, InputGroup, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_BASE_URL = 'http://localhost:5000/api/v1'

const ControlBusqueda = () => {
  const [libros, setLibros] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('titulo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLibros()
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
      Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: 'La solicitud de reposición fue enviada correctamente.',
        confirmButtonColor: '#8a2c31'
      })
    } catch (err) {
      console.error('Error al solicitar reposición:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar la solicitud de reposición.',
        confirmButtonColor: '#8a2c31'
      })
    }
  }

  return (
    <div className="container mt-4">
      <h4 className="text-center fw-bold mb-4" style={{ color: '#8a2c31' }}>
        Control y Búsqueda de Libros
      </h4>

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

      {!loading && librosFiltrados.length === 0 && (
        <Alert variant="info" className="text-center mt-3">
          <i className="bi bi-info-circle me-2"></i>
          No se encontraron libros con los filtros actuales.
        </Alert>
      )}
    </div>
  )
}

export default ControlBusqueda