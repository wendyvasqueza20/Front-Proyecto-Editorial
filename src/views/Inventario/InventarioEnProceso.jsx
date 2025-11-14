import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

function InventarioEnProceso() {
  // --- Estados ---
  const [ordenes, setOrdenes] = useState([]);
  // const [formState, setFormState] = useState({ ... }); // Comentado para evitar errores de no uso
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [cerrarOrdenVisible, setCerrarOrdenVisible] = useState(false);
  const [ordenACerrar, setOrdenACerrar] = useState(null);
  const [tirajeTotal, setTirajeTotal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Componente de Modal Personalizado (Reutilizado de tu código) ---
  const CustomModal = ({ visible, onClose, title, children }) => {
    if (!visible) return null;
    const backdropStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000, // Alto zIndex para que esté sobre la tabla
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '4rem',
      padding: '1rem',
    };
    const modalStyle = {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      width: '91.666667%',
      maxWidth: '42rem',
      overflow: 'hidden',
    };
    if (window.innerWidth >= 768) {
      modalStyle.width = '50%';
    }
    const modalHeaderStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
    };
    const modalTitleStyle = {
      fontSize: '1.25rem',
      fontWeight: 'bold',
    };
    const modalCloseBtnStyle = {
      color: '#4b5563',
      fontSize: '1.875rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    };

    return (
      <div style={backdropStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <div style={modalHeaderStyle}>
            <h5 style={modalTitleStyle}>{title}</h5>
            <button onClick={onClose} style={modalCloseBtnStyle}>
              &times;
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    );
  };

  // URL de la API (Asegúrate que sea el endpoint del controlador)
  const API_URL = 'http://localhost:5000/api/inventario-proceso';

  // --- Funciones de Modales Auxiliares ---
  const abrirModalAlert = useCallback((mensaje) => {
    setAlertMessage(mensaje);
    setAlertVisible(true);
  }, []);

  // Cargar Órdenes de Producción
  const fetchOrdenesProduccion = useCallback(async () => {
    try {
      // Esta llamada trae las órdenes con estado 'En Proceso'
      const response = await axios.get(API_URL); 
      setOrdenes(response.data);
    } catch (error) {
      console.error('Error al obtener las órdenes:', error);
      abrirModalAlert('No se pudieron cargar las órdenes. Revisa la conexión con la API y el estado.');
    }
  }, [abrirModalAlert]);

  useEffect(() => {
    fetchOrdenesProduccion();
  }, [fetchOrdenesProduccion]);


  // --- Lógica para Cerrar Orden ---
  const handleCerrarOrdenClick = (item) => {
    setOrdenACerrar(item);
    setTirajeTotal(item.tiraje_total > 0 ? item.tiraje_total : '');
    setCerrarOrdenVisible(true);
  };

  const handleCerrarOrdenSubmit = async (e) => {
    e.preventDefault();

    if (!tirajeTotal || isNaN(tirajeTotal) || Number(tirajeTotal) <= 0) {
      abrirModalAlert('Por favor, ingrese un "Tiraje Total" válido.');
      return;
    }

    // ID de usuario estático (debes ajustarlo a tu lógica de autenticación real)
    const ID_USUARIO_LOGUEADO = 5; 
    const body = {
      tiraje_total: parseInt(tirajeTotal, 10),
      id_usuario: ID_USUARIO_LOGUEADO,
    };

    try {
      const id = ordenACerrar.id_orden_produccion;
      // Llama al endpoint del controlador que llama al SP
      await axios.post(`${API_URL}/cerrar/${id}`, body); 

      setCerrarOrdenVisible(false);
      toast.success('¡Orden cerrada exitosamente!'); // Usando toast
      fetchOrdenesProduccion();
    } catch (error) {
      console.error('Error al cerrar la orden:', error);
      // Muestra el mensaje de error del backend (ej: "su estado no es EN_PROCESO.")
      const mensajeError = error.response?.data?.error || 'Ocurrió un error al cerrar la orden.';
      abrirModalAlert(`Error: ${mensajeError}`);
    }
  };

  // --- Lógica de Búsqueda ---
  const inventarioFiltrado = ordenes.filter(
    (item) =>
      (item.id_orden_produccion?.toString() || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.ISBN?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.estado_orden?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
  );

  const generarReportePDF = () => {
    window.print();
  };

  return (
    <div className="shadow-sm p-3 mb-5 bg-white rounded print-container">
      {/* --- Estilos (Solo CSS para la vista) --- */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; }
          .logo-print { display: flex !important; flex-direction: column; align-items: center; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .logo-print img { width: 150px; margin-bottom: 10px; }
          .logo-print h1 { margin: 0; font-size: 24px; }
          .logo-print h2 { margin: 5px 0 0; font-size: 18px; color: #555; }
        }
        .logo-print { display: none; }
        .btn { border: none; cursor: pointer; transition: background-color 0.3s; color: white; font-weight: bold; padding: 0.5rem 1rem; border-radius: 0.25rem; }
        .btn-accion { padding: 0.5rem 0.75rem; }
        .btn-cerrar { background-color: #16a34a; } /* Verde para Cerrar Orden */
        .btn-cerrar:hover { background-color: #15803d; }
        .btn-pdf { background-color: #3b82f6; }
        .btn-pdf:hover { background-color: #2563eb; }
        .btn-primary { background-color: #4f46e5; }
        .btn-primary:hover { background-color: #4338ca; }
        .btn-secondary { background-color: #6b7280; }
        .btn-secondary:hover { background-color: #4b5563; }
        .top-button-container { display: flex; justify-content: flex-end; }
        .top-button-container > * + * { margin-left: 8px; }
        .action-button-container { display: flex; }
        .action-button-container > * + * { margin-left: 8px; }
        .main-container { padding: 1rem; }
        .search-container { margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; }
        .search-input-wrapper { width: 100%; padding-right: 0.5rem; }
        @media (min-width: 768px) { .search-input-wrapper { width: 33.333333%; } }
        .search-input { appearance: none; display: block; width: 100%; background-color: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 0.25rem; padding: 0.75rem 1rem; line-height: 1.25; }
        .search-input:focus { outline: none; background-color: white; border-color: #6b7280; }
        .table-wrapper { overflow-x: auto; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .main-table { width: 100%; min-width: 100%; border-collapse: collapse; border-color: #e5e7eb; }
        .main-table thead { background-color: #f9fafb; }
        .main-table th { 
          padding: 0.75rem 1.5rem; 
          text-align: left; 
          font-size: 0.75rem; 
          font-weight: 700; 
          color: #1f2937; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }
        .main-table tbody { background-color: white; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
        .main-table td { padding: 1rem 1.5rem; font-size: 0.875rem; color: #111827; white-space: nowrap; border-bottom: 1px solid #e5e7eb; }
        .status-badge { display: inline-flex; padding: 0.125rem 0.5rem; font-size: 0.75rem; line-height: 1.25; font-weight: 600; border-radius: 9999px; }
        .status-en-proceso { background-color: #fef3c7; color: #92400e; }
        .status-otro { background-color: #f3f4f6; color: #374151; }
        .modal-body { padding: 1.5rem; }
        .modal-body p { margin-bottom: 0.5rem; }
        .modal-body strong { font-weight: bold; }
        .modal-form-label { display: block; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; font-size: 0.75rem; font-weight: bold; margin-bottom: 0.5rem; }
        .modal-form-input { appearance: none; display: block; width: 100%; background-color: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 0.25rem; padding: 0.75rem 1rem; line-height: 1.25; }
        .modal-footer { display: flex; justify-content: flex-end; padding: 1rem; border-top: 1px solid #e5e7eb; }
        .modal-footer > * + * { margin-left: 0.5rem; }
      `}</style>

      {/* --- Contenido --- */}
      <div className="border-0 bg-light no-print p-4">
        <h4 className="mb-0 text-xl font-semibold">Gestión de Órdenes de Producción</h4>
      </div>

      <div className="main-container">
        <div className="logo-print">{/* ... (logo) ... */}</div>

        <div className="search-container no-print">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Buscar por ID Orden, ISBN o Estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="top-button-container">
            <button className="btn btn-pdf" onClick={generarReportePDF}>
              Generar Reporte PDF
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="main-table">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>ISBN</th>
                <th>Tiraje Total</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th className="no-print">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((item) => (
                <tr key={item.id_orden_produccion}>
                  <td>{item.id_orden_produccion}</td>
                  <td>{item.ISBN}</td>
                  <td>{item.tiraje_total > 0 ? item.tiraje_total : 'Pendiente'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        // CORRECCIÓN: Usa 'En Proceso' (la versión de la tabla) para aplicar el estilo
                        item.estado_orden === 'En Proceso' ? 'status-en-proceso' : 'status-otro'
                      }`}
                    >
                      {item.estado_orden}
                    </span>
                  </td>
                  <td>{new Date(item.fecha_inicio).toLocaleString('es-HN')}</td>
                  <td className="no-print action-button-container">
                    {/* CORRECCIÓN: Solo mostrar el botón si la orden está 'En Proceso' */}
                    {item.estado_orden === 'En Proceso' && (
                      <button
                        className="btn btn-cerrar btn-accion" // Cambiado a 'btn-cerrar' (verde)
                        onClick={() => handleCerrarOrdenClick(item)}
                      >
                        Cerrar Orden
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modales --- */}
      {/* El CustomModal para Confirmación fue eliminado para simplificar, ya que no se usaba */}

      <CustomModal visible={alertVisible} onClose={() => setAlertVisible(false)} title="Aviso">
        <div className="modal-body">
          <p>{alertMessage}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => setAlertVisible(false)}>
            Entendido
          </button>
        </div>
      </CustomModal>

      <CustomModal
        visible={cerrarOrdenVisible}
        onClose={() => setCerrarOrdenVisible(false)}
        title="Cerrar Orden de Producción"
      >
        <form onSubmit={handleCerrarOrdenSubmit}>
          <div className="modal-body">
            <p>
              Está a punto de cerrar la orden de producción:{' '}
              <strong>{ordenACerrar?.id_orden_produccion}</strong>.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Esta acción descontará la materia prima y añadirá los libros al inventario terminado.
            </p>
            <div style={{ width: '100%' }}>
              <label className="modal-form-label" htmlFor="tirajeTotal">
                Tiraje Total (Unidades Producidas)
              </label>
              <input
                type="number"
                id="tirajeTotal"
                value={tirajeTotal}
                onChange={(e) => setTirajeTotal(e.target.value)}
                placeholder="Ej: 500"
                required
                className="modal-form-input"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Cerrar Orden
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCerrarOrdenVisible(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
}

export default InventarioEnProceso;