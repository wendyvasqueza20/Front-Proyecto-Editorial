import React, { useState } from 'react';
import { Container, Card, Form, Button, Tabs, Tab, Modal } from 'react-bootstrap';

// Componente para añadir un autor en un modal
function AddAuthorModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Añadir Autor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="space-y-4">
          <Form.Control type="text" placeholder="Nombre completo" className="mb-3" />
          <Form.Control as="textarea" placeholder="Biografía" className="mb-3" />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Componente para vincular autor a libro (sin modal por ser simple)
function LinkAuthorToBook() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Vincular Autor a Libro</h2>
      <Form className="space-y-4">
        <Form.Select className="mb-3">
          <option>Selecciona un autor</option>
        </Form.Select>
        <Form.Select className="mb-3">
          <option>Selecciona un libro</option>
        </Form.Select>
        <Button variant="secondary" type="submit">
          Vincular
        </Button>
      </Form>
    </div>
  );
}

// Componente para añadir un libro en un modal
function AddBookModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Añadir Libro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="space-y-4">
          <Form.Control type="text" placeholder="Título" className="mb-3" />
          <Form.Control type="text" placeholder="Autor" className="mb-3" />
          <Form.Control type="text" placeholder="ISBN" className="mb-3" />
          <Form.Control type="text" placeholder="Edición" className="mb-3" />
          <Form.Control type="text" placeholder="Temas" className="mb-3" />
          <Form.Control type="number" placeholder="Cantidad disponible" className="mb-3" />
          <Form.Control type="number" placeholder="Cantidad mínima antes de alerta" className="mb-3" />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Componente para editar un libro en un modal
function EditBookModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Actualizar Detalles del Libro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="space-y-4">
          <Form.Select className="mb-3">
            <option>Selecciona un libro</option>
          </Form.Select>
          <Form.Control type="text" placeholder="Nuevo título" className="mb-3" />
          <Form.Control type="number" placeholder="Nueva cantidad" className="mb-3" />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Componente para crear una categoría en un modal
function CreateCategoryModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="space-y-4">
          <Form.Control type="text" placeholder="Nombre de la categoría" className="mb-3" />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Componente para asignar una categoría a un libro (sin modal)
function AssignCategory() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Asignar Categoría a Libro</h2>
      <Form className="space-y-4">
        <Form.Select className="mb-3">
          <option>Selecciona un libro</option>
        </Form.Select>
        <Form.Select className="mb-3">
          <option>Selecciona una categoría</option>
        </Form.Select>
        <Button variant="secondary" type="submit">
          Asignar
        </Button>
      </Form>
    </div>
  );
}

// Componente para crear un tema en un modal
function CreateThemeModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Tema</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="space-y-4">
          <Form.Control type="text" placeholder="Nombre del tema" className="mb-3" />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Componente para asignar un tema a un libro (sin modal)
function AssignTheme() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Asignar Tema a Libro</h2>
      <Form className="space-y-4">
        <Form.Select className="mb-3">
          <option>Selecciona un libro</option>
        </Form.Select>
        <Form.Select className="mb-3">
          <option>Selecciona un tema</option>
        </Form.Select>
        <Button variant="secondary" type="submit">
          Asignar
        </Button>
      </Form>
    </div>
  );
}

// Componente de control y búsqueda (sin modal)
function BookAlertAndSearch() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Control de Existencias y Búsqueda</h2>
      <Form className="space-y-4">
        <Form.Control type="text" placeholder="Buscar por título, autor, ISBN o tema" className="mb-3" />
        <Button variant="secondary" type="submit">
          Buscar
        </Button>
      </Form>
      <div className="mt-4">
        <p className="text-danger fw-bold">⚠ Libros con cantidad por debajo del mínimo:</p>
        <Button variant="secondary" className="mt-2">
          Solicitar Reposición
        </Button>
      </div>
    </div>
  );
}

export default function BooksPage() {
    const [key, setKey] = useState('autores');
    const [showAddAuthor, setShowAddAuthor] = useState(false);
    const [showAddBook, setShowAddBook] = useState(false);
    const [showEditBook, setShowEditBook] = useState(false);
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [showCreateTheme, setShowCreateTheme] = useState(false);

    const handleCloseAddAuthor = () => setShowAddAuthor(false);
    const handleShowAddAuthor = () => setShowAddAuthor(true);
    
    const handleCloseAddBook = () => setShowAddBook(false);
    const handleShowAddBook = () => setShowAddBook(true);
    
    const handleCloseEditBook = () => setShowEditBook(false);
    const handleShowEditBook = () => setShowEditBook(true);

    const handleCloseCreateCategory = () => setShowCreateCategory(false);
    const handleShowCreateCategory = () => setShowCreateCategory(true);

    const handleCloseCreateTheme = () => setShowCreateTheme(false);
    const handleShowCreateTheme = () => setShowCreateTheme(true);

    return (
        <Container className="p-4">
            <h1 className="my-4 text-2xl fw-bold">Gestión de Libros Terminados</h1>
            <Tabs
                id="books-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3"
            >
                <Tab eventKey="autores" title="Autores">
                    <Card className="mb-4">
                        <Card.Body>
                            <Button variant="secondary" onClick={handleShowAddAuthor}>Añadir Autor</Button>
                            <AddAuthorModal show={showAddAuthor} handleClose={handleCloseAddAuthor} />
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <LinkAuthorToBook />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="libros" title="Libros">
                    <Card className="mb-4">
                        <Card.Body>
                            <Button variant="secondary" onClick={handleShowAddBook}>Añadir Libro</Button>
                            <AddBookModal show={showAddBook} handleClose={handleCloseAddBook} />
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <Button variant="secondary" onClick={handleShowEditBook}>Actualizar Detalles del Libro</Button>
                            <EditBookModal show={showEditBook} handleClose={handleCloseEditBook} />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="control" title="Control y Búsqueda">
                    <Card>
                        <Card.Body>
                            <BookAlertAndSearch />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="categorias" title="Categorías y Temas">
                    <Card className="mb-4">
                        <Card.Body>
                            <Button variant="secondary" onClick={handleShowCreateCategory}>Crear Categoría</Button>
                            <CreateCategoryModal show={showCreateCategory} handleClose={handleCloseCreateCategory} />
                        </Card.Body>
                    </Card>
                    <Card className="mb-4">
                        <Card.Body>
                            <AssignCategory />
                        </Card.Body>
                    </Card>
                    <Card className="mb-4">
                        <Card.Body>
                            <Button variant="secondary" onClick={handleShowCreateTheme}>Crear Tema</Button>
                            <CreateThemeModal show={showCreateTheme} handleClose={handleCloseCreateTheme} />
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <AssignTheme />
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
}