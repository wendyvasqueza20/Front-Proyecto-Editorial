import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Inicio.css';

export default function Inicio() {
  const navigate = useNavigate();

  const handleVerInventario = () => {
    navigate('/dashboard/inventario/general');
    toast.info('Redirigiendo a inventario…');
  };

  return (
    <div className="inicio-container">
      <div className="inicio-card">
        <h1 className="inicio-title">Bienvenido al Sistema</h1>
        <p className="inicio-desc">
          Editorial Guaymuras – Construyendo memoria
        </p>

        <div className="inicio-stats">
          <div className="stat-box">
            <span className="stat-number">1,234</span>
            <span className="stat-label">Libros activos</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">567</span>
            <span className="stat-label">Ventas mes</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">89</span>
            <span className="stat-label">Proveedores</span>
          </div>
        </div>

        <button className="inicio-btn" onClick={handleVerInventario}>
          Ver inventario
        </button>
      </div>
    </div>
  );
}