import { useState } from 'react';
import { toast } from 'react-toastify';
import './ParametrosUsuariosRoles.css';

export default function ParametrosUsuariosRoles() {
  const [rol, setRol] = useState('Administrador');
  const [permisos, setPermisos] = useState({
    inventario: true,
    compras: true,
    ventas: false,
    reportes: true,
  });

  const togglePermiso = (key) =>
    setPermisos((p) => ({ ...p, [key]: !p[key] }));

  const handleGuardar = () => {
    toast.success('Roles y permisos actualizados');
  };

  return (
    <div className="parametros-container">
      <h2 className="parametros-title">Usuarios y Roles</h2>
      <p className="parametros-desc">
        Asigne o modifique permisos por rol dentro del sistema.
      </p>

      <div className="parametros-card">
        <div className="parametros-group">
          <label>Rol a configurar</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option>Administrador</option>
            <option>Editor</option>
            <option>Consultor</option>
          </select>
        </div>

        <div className="permisos-grid">
          {Object.entries(permisos).map(([key, value]) => (
            <label key={key} className="permiso-check">
              <input
                type="checkbox"
                checked={value}
                onChange={() => togglePermiso(key)}
              />
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </label>
          ))}
        </div>

        <button className="parametros-btn" onClick={handleGuardar}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}