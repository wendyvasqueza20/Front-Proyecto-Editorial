import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Lock } from 'lucide-react'; // Icono para el botón de cerrar orden

// URL de la API (Asegúrate que sea el endpoint del controlador)
const API_URL = 'http://localhost:5000/api/inventario-proceso';

// --- Componente de Modal Personalizado ---
const CustomModal = ({ visible, onClose, title, children }) => {
  if (!visible) return null;
  
  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000, 
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
    marginTop: '2rem'
  };

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

// Componente principal (renombrado de nuevo a InventarioEnProceso)
function InventarioEnProceso() {
  // --- Estados ---
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [cerrarOrdenVisible, setCerrarOrdenVisible] = useState(false);
  const [ordenACerrar, setOrdenACerrar] = useState(null);
  const [tirajeTotal, setTirajeTotal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // ESTADO PARA NOTIFICACIÓN
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'success' }); 

  // --- Funciones de Modales Auxiliares ---
  const abrirModalAlert = useCallback((mensaje) => {
    setAlertMessage(mensaje);
    setAlertVisible(true);
  }, []);
  
  // FUNCIÓN: Notificación temporal en la esquina
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ visible: true, message, type });
    // Ocultar la notificación después de 4 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000); 
  }, []); 


  // Cargar Órdenes de Producción
  const fetchOrdenesProduccion = useCallback(async () => {
    setLoading(true);
    try {
      // Esta llamada trae las órdenes con estado 'En Proceso'
      const response = await axios.get(API_URL); 
      setOrdenes(response.data);
    } catch (error) {
      console.error('Error al obtener las órdenes:', error);
      abrirModalAlert('No se pudieron cargar las órdenes. Revisa la conexión con la API y el estado.');
    } finally {
      setLoading(false);
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
      abrirModalAlert('Por favor, ingrese un "Tiraje Total" válido (mayor a 0).');
      return;
    }

    // ⚠️ CRÍTICO: Reemplazar este valor estático (5) con el ID del usuario autenticado
    const ID_USUARIO_LOGUEADO = 5; 
    
    const body = {
      // Asegurar que el tiraje sea un entero para el SP
      tiraje_total: parseInt(tirajeTotal, 10), 
      id_usuario: ID_USUARIO_LOGUEADO,
    };

    try {
      const id = ordenACerrar.id_orden_produccion;
      // Llama al endpoint del controlador que ejecuta el SP (sp_cerrar_orden_produccion)
      await axios.post(`${API_URL}/cerrar/${id}`, body); 

      setCerrarOrdenVisible(false);
      // Muestra la notificación de éxito en la esquina izquierda
      showNotification('¡Orden cerrada exitosamente!', 'success');
      fetchOrdenesProduccion();
    } catch (error) {
      console.error('Error al cerrar la orden:', error);
      // Muestra el error en el modal (mejor que la notificación para errores críticos de API)
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
        /* Estilos de impresión */
        @media print {
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; }
          .logo-print { display: flex !important; flex-direction: column; align-items: center; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .logo-print h1 { margin: 0; font-size: 24px; }
          .logo-print h2 { margin: 5px 0 0; font-size: 18px; color: #555; }
          .main-table th, .main-table td { color: #000 !important; }
        }
        .logo-print { display: none; }

        /* Estilos de botones */
        .btn { 
          border: none; 
          cursor: pointer; 
          transition: background-color 0.3s, transform 0.1s; 
          color: white; 
          font-weight: bold; 
          padding: 0.5rem 1rem; 
          border-radius: 0.25rem; 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          line-height: 1; /* Asegura la correcta alineación vertical del texto y el ícono */
        }
        .btn:active { transform: scale(0.98); }
        .btn-accion { padding: 0.5rem 0.75rem; }
        .btn-cerrar { background-color: #16a34a; } 
        .btn-cerrar:hover { background-color: #15803d; }
        .btn-pdf { background-color: #3b82f6; }
        .btn-pdf:hover { background-color: #2563eb; }
        .btn-primary { background-color: #4f46e5; }
        .btn-primary:hover { background-color: #4338ca; }
        .btn-secondary { background-color: #6b7280; }
        .btn-secondary:hover { background-color: #4b5563; }

        /* Contenedores y Layout */
        .top-button-container { display: flex; justify-content: flex-end; }
        .top-button-container > * + * { margin-left: 8px; }
        .action-button-container { display: flex; }
        .action-button-container > * + * { margin-left: 8px; }
        .main-container { padding: 1rem; }
        .search-container { margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .search-input-wrapper { flex-grow: 1; min-width: 200px; }
        @media (min-width: 768px) { .search-input-wrapper { width: 33.333333%; } }
        
        /* Input */
        .search-input { appearance: none; display: block; width: 100%; background-color: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 0.25rem; padding: 0.75rem 1rem; line-height: 1.25; }
        .search-input:focus { outline: none; background-color: white; border-color: #6b7280; }
        .modal-form-input { appearance: none; display: block; width: 100%; background-color: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 0.25rem; padding: 0.75rem 1rem; line-height: 1.25; }

        /* Tabla */
        .table-wrapper { overflow-x: auto; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .main-table { width: 100%; min-width: 700px; border-collapse: collapse; border-color: #e5e7eb; }
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

        /* Modal */
        .modal-body { padding: 1.5rem; }
        .modal-body p { margin-bottom: 0.5rem; }
        .modal-body strong { font-weight: bold; }
        .modal-form-label { display: block; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; font-size: 0.75rem; font-weight: bold; margin-bottom: 0.5rem; }
        .modal-footer { display: flex; justify-content: flex-end; padding: 1rem; border-top: 1px solid #e5e7eb; }
        .modal-footer > * + * { margin-left: 0.5rem; }

        /* ESTILO CORREGIDO: Notificación Lateral Superior Derecha */
        .notification-banner {
            position: fixed;
            top: 20px; 
            right: 20px; /* <--- CAMBIO REALIZADO AQUÍ */
            left: auto; /* Asegura que no interfiera con el 'left' anterior */
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: bold;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
            z-index: 1100;
            opacity: 1;
            transition: opacity 0.3s ease-out;
            min-width: 250px;
        }
        .notification-success { background-color: #16a34a; } /* Verde para éxito */
        .notification-error { background-color: #dc2626; } /* Rojo para error (si se usara) */
      `}</style>

      {/* --- Contenido --- */}
      <div className="border-0 bg-light no-print p-4" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <h4 className="mb-0 text-xl font-semibold text-gray-800">
          <Lock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Gestión de Órdenes de Producción en Proceso
        </h4>
      </div>

      <div className="main-container">
        <div className="logo-print">
          <h1>Reporte de Órdenes en Proceso</h1>
          <h2>{new Date().toLocaleDateString()}</h2>
        </div>

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
        
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Cargando órdenes...</div>}
        
        {!loading && inventarioFiltrado.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '0.5rem', marginTop: '1rem' }}>
            No se encontraron órdenes de producción 'En Proceso'.
          </div>
        )}

        {!loading && inventarioFiltrado.length > 0 && (
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
                          item.estado_orden === 'En Proceso' ? 'status-en-proceso' : 'status-otro'
                        }`}
                      >
                        {item.estado_orden}
                      </span>
                    </td>
                    <td>{new Date(item.fecha_inicio).toLocaleString('es-HN')}</td>
                    <td className="no-print action-button-container">
                      {item.estado_orden === 'En Proceso' && (
                        <button
                          className="btn btn-cerrar btn-accion" 
                          onClick={() => handleCerrarOrdenClick(item)}
                        >
                          <Lock size={16} style={{ marginRight: '4px' }}/>
                          Cerrar Orden
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modales --- */}
      <CustomModal visible={alertVisible} onClose={() => setAlertVisible(false)} title="Aviso">
        <div className="modal-body">
          <p className="text-red-600 font-medium">{alertMessage}</p>
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
            <p style={{ marginBottom: '1rem' }} className="text-sm text-gray-500">
              Esta acción disparará el SP en la API para: 1. Descontar materia prima, 2. Añadir los libros al inventario terminado, y 3. Registrar movimientos.
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
                min="1"
                required
                className="modal-form-input"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              <Lock size={16} style={{ marginRight: '4px' }}/>
              Confirmar Cierre
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

      {/* COMPONENTE: Notificación Lateral Superior Derecha */}
      {notification.visible && (
        <div className={`notification-banner notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

    </div>
  );
}

// Exportación del componente
export default InventarioEnProceso;