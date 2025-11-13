// src/views/Administracion/Bitacora.jsx
import React, { useEffect, useState } from 'react';
import { Table, Card, Spinner, Form, Row, Col, Button } from 'react-bootstrap';
import { getBitacora } from '../../api/bitacora.service';

const Bitacora = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState('');
  const [accion, setAccion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // Traer todos los registros para filtrar y paginar en frontend
        const res = await getBitacora(1, 10000); // Trae hasta 10,000 registros
        setLogs(res.data);
        setTotal(res.data.length);
      } catch (err) {
        setLogs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filtrado de registros (sobre todos los registros)
  const usuariosUnicos = Array.from(new Set(logs.map(l => l.id_usuario))).filter(Boolean);
  const accionesUnicas = Array.from(new Set(logs.map(l => l.accion))).filter(Boolean);
  const logsFiltrados = logs.filter(log => {
    const coincideUsuario = usuario ? String(log.id_usuario) === usuario : true;
    const coincideAccion = accion ? log.accion === accion : true;
    const coincideBusqueda = busqueda
      ? (
          String(log.id_usuario)?.toLowerCase().includes(busqueda.toLowerCase()) ||
          log.accion?.toLowerCase().includes(busqueda.toLowerCase()) ||
          log.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
          log.tabla_afectada?.toLowerCase().includes(busqueda.toLowerCase())
        )
      : true;
    return coincideUsuario && coincideAccion && coincideBusqueda;
  });

  // Paginación sobre los resultados filtrados
  const totalFiltrados = logsFiltrados.length;
  const totalPages = Math.ceil(totalFiltrados / limit);
  const logsPagina = logsFiltrados.slice((page - 1) * limit, page * limit);

  return (
    <div className="container mt-4">
      <Card className="p-3 shadow-sm">
        <h4 className="mb-4 text-primary">
          <i className="bi bi-journal-text me-2" /> Bitácora del Sistema
        </h4>
        {/* Filtros */}
        <Form className="mb-3">
          <Row className="g-2 align-items-end">
            <Col md={4} sm={6} xs={12}>
              <Form.Label>Usuario</Form.Label>
              <Form.Select value={usuario} onChange={e => setUsuario(e.target.value)}>
                <option value="">Todos</option>
                {usuariosUnicos.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} sm={6} xs={12}>
              <Form.Label>Acción</Form.Label>
              <Form.Select value={accion} onChange={e => setAccion(e.target.value)}>
                <option value="">Todas</option>
                {accionesUnicas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} sm={12} xs={12}>
              <Form.Label>Búsqueda</Form.Label>
              <Form.Control
                type="text"
                placeholder="Buscar por usuario, acción o descripción"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setUsuario(''); setAccion(''); setBusqueda(''); }}
              >
                Limpiar filtros
              </Button>
            </Col>
          </Row>
        </Form>
        <div style={{overflowX:'auto'}}>
          <Table striped bordered hover responsive className="align-middle text-center" style={{background:'#fff', borderRadius:8}}>
            <thead className="table-primary">
              <tr>
                <th style={{minWidth:120}}>Fecha</th>
                <th style={{minWidth:90}}>Usuario</th>
                <th style={{minWidth:120}}>Acción</th>
                <th style={{minWidth:200}}>Descripción</th>
                <th style={{minWidth:120}}>Tabla</th>
                <th style={{minWidth:120}}>Antes</th>
                <th style={{minWidth:120}}>Después</th>
                <th style={{minWidth:120}}>IP</th>
                <th style={{minWidth:120}}>User Agent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    <Spinner animation="border" size="sm" className="me-2" />Cargando...
                  </td>
                </tr>
              ) : logsPagina.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted">No hay registros en la bitácora.</td>
                </tr>
              ) : (
                logsPagina.map((log, idx) => (
                  <tr key={idx}>
                    <td>{new Date(log.fecha).toLocaleString()}</td>
                    <td>{log.id_usuario}</td>
                    <td><span className="badge bg-info text-dark">{log.accion}</span></td>
                    <td className="text-start" style={{maxWidth:320,overflow:'auto'}}>{log.descripcion}</td>
                    <td>{log.tabla_afectada}</td>
                    <td style={{maxWidth:120,overflow:'auto'}}>{log.antes}</td>
                    <td style={{maxWidth:120,overflow:'auto'}}>{log.despues}</td>
                    <td>{log.ip}</td>
                    <td style={{maxWidth:180,overflow:'auto'}}>{log.user_agent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        {/* Paginación */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span>
            Página {page} de {totalPages} ({totalFiltrados} registros)
          </span>
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="me-2"
            >Anterior</Button>
            <Button
              variant="outline-primary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >Siguiente</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Bitacora;
