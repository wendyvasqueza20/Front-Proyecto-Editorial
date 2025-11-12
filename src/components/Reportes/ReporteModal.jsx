// src/components/Reportes/ReporteModal.jsx
import React from 'react'
import { Modal, Button, Table } from 'react-bootstrap'

const ReporteModal = ({ show, onClose, titulo, datos, columnas = [] }) => {
  const fecha = new Date().toISOString().split('T')[0]

  const imprimir = () => window.print()

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Reporte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ border: '1px solid #000', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><strong>FECHA:</strong> {fecha}</div>
          </div>

          <h4 style={{ textAlign: 'center', marginTop: 10 }}>EDITORIAL GUAYMURAS</h4>
          <h5 style={{ textAlign: 'center' }}>{titulo}</h5>

          <Table bordered size="sm" className="mt-3">
            <thead>
              <tr>
                {columnas.map((c) => <th key={c.key}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, idx) => (
                <tr key={idx}>
                  {columnas.map((c) => <td key={c.key}>{fila[c.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={imprimir}>Imprimir</Button>
        <Button variant="secondary" onClick={onClose}>Salir</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ReporteModal
