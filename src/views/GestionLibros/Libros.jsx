// src/views/GestionLibros/Libros.jsx
import React, { useState, useEffect } from 'react';
import { Button, Table, Card, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import LibroModal from '../../components/Libros/LibroModal';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const Libros = () => {
  const [showModal, setShowModal] = useState(false);
  const [libros, setLibros] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [autores, setAutores] = useState([]);
  const [temas, setTemas] = useState([]);

  const [formData, setFormData] = useState({
    titulo: '',
    autorId: '',
    isbn: '',
    edicion: '',
    cantidad_disponible: '',
    cantidad_minima: '',
    temaId: '',
  });

  useEffect(() => {
    fetchLibros();
    fetchAutores();
    fetchTemas();
  }, []);

  const fetchLibros = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/libros`);
      setLibros(response.data);
    } catch (error) {
      console.error('Error al cargar libros:', error);
      setError('No se pudieron cargar los libros');
    } finally {
      setLoading(false);
    }
  };

  const fetchAutores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/autores`);
      setAutores(response.data);
    } catch (error) {
      console.error('Error al cargar autores:', error);
    }
  };

  const fetchTemas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/temas`);
      setTemas(response.data);
    } catch (error) {
      console.error('Error al cargar temas:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    if (name === 'temas') {
      const selected = Array.from(selectedOptions).map((opt) => opt.value);
      setFormData({ ...formData, temas: selected });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editId !== null) {
        await axios.put(`${API_BASE_URL}/libros/${editId}`, formData);
        toast.success('Libro actualizado correctamente');
      } else {
        await axios.post(`${API_BASE_URL}/libros`, formData);
        toast.success('Libro creado correctamente');
      }
      await fetchLibros();
      resetForm();
    } catch (error) {
      console.error('Error al guardar libro:', error);
      toast.error('No se pudo guardar el libro');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (libro) => {
    setEditId(libro.id_libro);
    setFormData({
      titulo: libro.titulo || '',
      autorId: libro.id_autor || '',
      isbn: libro.isbn || '',
      edicion: libro.edicion || '',
      cantidad_disponible: libro.cantidad_disponible || '',
      cantidad_minima: libro.cantidad_minima || '',
      temaId: libro.temas?.[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que desea eliminar este libro?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/libros/${id}`);
      toast.success('Libro eliminado correctamente');
      await fetchLibros();
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      toast.error('No se pudo eliminar el libro');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      autorId: '',
      isbn: '',
      edicion: '',
      cantidad_disponible: '',
      cantidad_minima: '',
      temaId: '',
    });
    setEditId(null);
    setShowModal(false);
    setModalLoading(false);
  };

  const librosFiltrados = libros.filter((l) =>
    l.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h4 className="fw-bold" style={{ color: '#8a2c31' }}>
          Gestión de Libros
        </h4>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar libro..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
        </div>

        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Libro
        </Button>
      </div>

      <Card className="bg-white text-dark">
        <Table hover responsive className="m-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Autor</th>
              <th>ISBN</th>
              <th>Edición</th>
              <th>Disponible</th>
              <th>Mínima</th>
              <th>Acciones</th>
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
                  No hay libros registrados.
                </td>
              </tr>
            ) : (
              librosFiltrados.map((libro) => (
                <tr key={libro.id_libro}>
                  <td>{libro.id_libro}</td>
                  <td>{libro.titulo}</td>
                  <td>{libro.autor_nombre || '—'}</td>
                  <td>{libro.isbn}</td>
                  <td>{libro.edicion}</td>
                  <td>{libro.cantidad_disponible}</td>
                  <td>{libro.cantidad_minima}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(libro)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(libro.id_libro)}
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

      {/* Modal solo cuando los combos están listos */}
      {autores.length > 0 && temas.length > 0 && (
        <LibroModal
          show={showModal}
          onHide={resetForm}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
          editId={editId}
          loading={modalLoading}
          autores={autores}
          temas={temas}
        />
      )}
    </div>
  );
};

export default Libros;