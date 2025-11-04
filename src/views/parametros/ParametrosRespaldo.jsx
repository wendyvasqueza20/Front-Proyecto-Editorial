import { useState } from 'react';
import { toast } from 'react-toastify';
import './ParametrosRespaldo.css';

export default function ParametrosRespaldo() {
  const [tipo, setTipo] = useState('completo');

  const handleRespaldo = () => {
    toast.success(`Respaldo ${tipo} iniciado (simulación)`);
  };

  const handleRestaurar = () => {
    toast.warning('Restauración en proceso (simulación)');
  };

  return (
    <div className="parametros-container">
      <h2 className="parametros-title">Respaldo y Restauración</h2>
      <p className="parametros-desc">
        Genere copias de seguridad o restaure información previa.
      </p>

      <div className="parametros-card">
        <div className="parametros-group">
          <label>Tipo de respaldo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="completo">Completo (BD + archivos)</option>
            <option value="solo-datos">Solo datos (BD)</option>
          </select>
        </div>

        <div className="respaldo-buttons">
          <button className="parametros-btn primary" onClick={handleRespaldo}>
            Generar respaldo
          </button>
          <button className="parametros-btn secondary" onClick={handleRestaurar}>
            Restaurar copia
          </button>
        </div>
      </div>
    </div>
  );
}