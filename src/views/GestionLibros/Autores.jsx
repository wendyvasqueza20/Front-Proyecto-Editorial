// src/views/GestionLibros/Autores.jsx
import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import AutorModal from '../../components/Autor/AutorModal';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const Autores = () => {
  const [autores, setAutores] = useState([]);
  const [libros, setLibros] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    biografia: '',
    autor_vincular: '',
    libro_vincular: '',
  });

  useEffect(() => {
    fetchAutores();
    fetchLibros();
  }, []);

  const fetchAutores = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/autores`);
      setAutores(res.data);
    } catch (err) {
      console.error('Error al cargar autores:', err);
      toast.error('No se pudieron cargar los autores');
    } finally {
      setLoading(false);
    }
  };

  const fetchLibros = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/libros`);
      setLibros(res.data);
    } catch (err) {
      console.error('Error al cargar libros:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGuardarAutor = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editId !== null) {
        await axios.put(`${API_BASE_URL}/autores/${editId}`, {
          nombre_completo: formData.nombre_completo,
          biografia: formData.biografia,
        });
        toast.success('Autor actualizado correctamente');
      } else {
        await axios.post(`${API_BASE_URL}/autores`, {
          nombre_completo: formData.nombre_completo,
          biografia: formData.biografia,
        });
        toast.success('Autor creado correctamente');
      }
      fetchAutores();
      resetForm();
    } catch (err) {
      console.error('Error al guardar autor:', err);
      toast.error('No se pudo guardar el autor');
    } finally {
      setModalLoading(false);
    }
  };

  const handleVincularAutor = async (autorId, libroId) => {
    if (!autorId || !libroId) {
      toast.warning('Debe seleccionar un autor y un libro');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/libros/${libroId}/autores`, { autorId });
      toast.success('Autor vinculado correctamente al libro');
      resetForm();
    } catch (err) {
      console.error('Error al vincular autor:', err);
      toast.error('No se pudo vincular el autor');
    }
  };

  const handleEdit = (autor) => {
    setEditId(autor.id);
    setFormData({
      nombre_completo: autor.nombre_completo || '',
      biografia: autor.biografia || '',
      autor_vincular: '',
      libro_vincular: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que desea eliminar este autor?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/autores/${id}`);
      toast.success('Autor eliminado correctamente');
      fetchAutores();
    } catch (err) {
      console.error('Error al eliminar autor:', err);
      toast.error('No se pudo eliminar el autor');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_completo: '',
      biografia: '',
      autor_vincular: '',
      libro_vincular: '',
    });
    setEditId(null);
    setShowModal(false);
    setModalLoading(false);
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h4 className="fw-bold" style={{ color: '#8a2c31' }}>
          Gestión de Autores
        </h4>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <i className="bi bi-person-plus me-2"></i>
          Agregar Autor
        </Button>
      </div>

      <Card className="bg-white text-dark">
        <Table hover responsive className="m-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Biografía</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  <Spinner animation="border" size="sm" /> Cargando autores...
                </td>
              </tr>
            ) : autores.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No hay autores registrados.
                </td>
              </tr>
            ) : (
              autores.map((autor) => (
                <tr key={autor.id}>
                  <td>{autor.id}</td>
                  <td>{autor.nombre_completo}</td>
                  <td>{autor.biografia}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(autor)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(autor.id)}
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

      {/* Modal siempre recibe arrays válidos */}
      <AutorModal
        show={showModal}
        onHide={resetForm}
        onSubmitAutor={handleGuardarAutor}
        onSubmitVinculo={handleVincularAutor}
        autores={autores} // nunca undefined
        libros={libros}   // nunca undefined
        formData={formData}
        onChange={handleChange}
        editId={editId}
        loading={modalLoading}
      />
    </div>
  );
};

export default Autores;