
// src/EntradaVentas/RegistroFactura.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, InputGroup, FormControl, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import ReporteModal from "../../components/Reportes/ReporteModal";

export default function RegistroFactura() {
  const [facturas, setFacturas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Facturas");
  const [showReporte, setShowReporte] = useState(false);

  // Función para filtrar facturas (definida primero)
  const getFilteredFacturas = () => {
    return facturas.filter((f) => {
      if (filterType === "Facturas") {
        return true;
      }
      if (filterType === "Cotizaciones") {
        return f.tipoVenta === "Cotización";
      }
      if (filterType === "Devoluciones") {
        return f.tipoVenta === "Devolución";
      }
      return true;
    }).filter(
      (f) =>
        f.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.numero.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Configuración de columnas para el reporte
  const columnasReporte = [
    { key: 'numero', label: 'N° Factura' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'tipoVenta', label: 'Tipo Venta' },
    { key: 'estado', label: 'Estado' },
    { key: 'total', label: 'Total (L.)' }
  ];

  // Datos para el reporte (optimizado con useMemo)
  const datosReporte = useMemo(() => {
    const filtered = getFilteredFacturas();
    return filtered.map(f => ({
      numero: f.numero,
      cliente: f.cliente || '-',
      fecha: f.fecha || '-',
      tipoVenta: f.tipoVenta || 'Normal',
      estado: f.estado,
      total: f.total.toFixed(2)
    }));
  }, [facturas, searchTerm, filterType]);

  // Facturas filtradas para mostrar en la tabla
  const filteredFacturas = getFilteredFacturas();

  const cargarFacturas = () => {
    const ventasGuardadas = localStorage.getItem("ventasRegistradas");
    if (ventasGuardadas) {
      const ventas = JSON.parse(ventasGuardadas);
      setFacturas(
        ventas.map((venta, index) => ({
          numero: venta.noFactura || `FAC-${String(index + 1).padStart(4, "0")}`,
          cliente: venta.cliente,
          fecha: venta.fecha,
          tipoVenta: venta.tipoVenta || "Normal",
          tipoPago: venta.tipoPago || "Efectivo",
          estado: venta.estadoFactura || "Pendiente",
          total: Number(venta.total) || 0,
          tipo: venta.tipo || "Facturas",
          pdfURL: venta.pdfURL || null,
        }))
      );
    } else {
      setFacturas([]);
    }
  };

  useEffect(() => {
    cargarFacturas();
    window.addEventListener("storage", cargarFacturas);
    return () => window.removeEventListener("storage", cargarFacturas);
  }, []);

  const verFactura = (factura) => {
    if (factura.pdfURL) {
      window.open(factura.pdfURL, "_blank");
    } else {
      Swal.fire("Aviso", "Esta factura no ha sido generada todavía.", "info");
    }
  };

  const anularFactura = (factura) => {
    Swal.fire({
      title: "¿Seguro que deseas anular esta factura?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const ventasGuardadas = localStorage.getItem("ventasRegistradas");
        if (!ventasGuardadas) return;

        const ventas = JSON.parse(ventasGuardadas);
        const ventasActualizadas = ventas.map((v) =>
          v.noFactura === factura.numero ? { ...v, estadoFactura: "Anulada" } : v
        );

        localStorage.setItem("ventasRegistradas", JSON.stringify(ventasActualizadas));
        cargarFacturas();
        Swal.fire("Anulada", "La factura fue anulada correctamente.", "success");
      }
    });
  };

  const eliminarFactura = (factura) => {
    Swal.fire({
      title: "¿Quieres eliminar esta factura?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const ventasGuardadas = localStorage.getItem("ventasRegistradas");
        if (!ventasGuardadas) return;

        const ventas = JSON.parse(ventasGuardadas);
        const ventasFiltradas = ventas.filter((v) => v.noFactura !== factura.numero);

        localStorage.setItem("ventasRegistradas", JSON.stringify(ventasFiltradas));
        cargarFacturas();
        Swal.fire("Eliminada", "La factura fue eliminada correctamente.", "success");
      }
    });
  };

  const handleGenerarReporte = () => {
    if (filteredFacturas.length === 0) {
      Swal.fire("Información", "No hay datos para generar el reporte con los filtros actuales.", "info");
      return;
    }
    setShowReporte(true);
  };

  const handleEditarFactura = (factura) => {
    Swal.fire("Editar", `Función editar para factura ${factura.numero} aún no implementada.`, "info");
  };

  return (
    <div>
      {/* Título centrado */}
      <Row className="mb-3">
        <Col className="text-center">
          <h4 className="fw-bold" style={{ color: '#8a2c31' }}>
            Historial de Facturas
          </h4>
        </Col>
      </Row>

      {/* Barra de búsqueda, filtro y botón en la misma fila */}
      <Row className="mb-3 align-items-center">
        <Col md={6} lg={4}>
          <InputGroup>
            <FormControl
              placeholder="Buscar cliente o número factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
          </InputGroup>
        </Col>
        <Col md={4} lg={3}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filtrar tipo"
          >
            <option value="Facturas">Facturas</option>
            <option value="Cotizaciones">Cotizaciones</option>
            <option value="Devoluciones">Devoluciones</option>
          </Form.Select>
        </Col>
        <Col xs="auto" className="text-end ms-auto">
          <Button 
            variant="outline-danger" 
            onClick={handleGenerarReporte}
            disabled={filteredFacturas.length === 0}
          >
            <i className="bi bi-file-earmark-pdf-fill me-2"></i> Generar Reporte
          </Button>
        </Col>
      </Row>

      {/* Tabla */}
      <Table
        striped
        bordered
        hover
        responsive
        style={{ backgroundColor: "white", color: "black" }}
      >
        <thead>
          <tr>
            <th>N° Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Tipo Venta</th>
            <th>Estado Factura</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredFacturas.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No hay facturas registradas
              </td>
            </tr>
          ) : (
            filteredFacturas.map((factura, index) => (
              <tr key={index}>
                <td>{factura.numero}</td>
                <td>{factura.cliente}</td>
                <td>{factura.fecha}</td>
                <td>{factura.tipoVenta}</td> 
                <td>{factura.estado}</td>
                <td>{factura.total.toFixed(2)}</td>
                <td>
                  <Button
                    variant="success"
                    className="me-1"
                    size="sm"
                    onClick={() => verFactura(factura)}
                  >
                    Ver Factura
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarFactura(factura)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal de Reporte */}
      <ReporteModal
        show={showReporte}
        onClose={() => setShowReporte(false)}
        titulo={`Reporte de ${filterType}`}
        columnas={columnasReporte}
        datos={datosReporte}
        filtroActual={`Tipo: ${filterType} | Búsqueda: "${searchTerm}"`}
      />
    </div>
  );
}